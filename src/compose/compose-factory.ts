/* eslint-disable typescript/no-unsafe-argument */
/* eslint-disable typescript/no-unsafe-assignment */
/* eslint-disable typescript/no-non-null-assertion */
/* eslint-disable typescript/require-await */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assign, capitalize, defaults, isError, omit, pick } from 'lodash-es'
import type { Command } from '../command/types'
import { getOptionsVariables } from '../compose/get-options-variables'
import { listIntent } from '../compose/list-intent'
import { matchIntent } from '../compose/match-intent'
import { CliError } from '../error'
import { help } from '../help/help'
import {
  PLACEHOLDER_REFERENCES,
  type Compose,
  type Context,
  type InputProperties,
  type Settings,
} from '../types'
import { assert } from '../utilities/assert'
import { extract } from '../utilities/extract'
import { suggest } from './suggest'

const defaultContext = (
  presetContext: Omit<Context, 'exited'>,
  userContext: Partial<Context>,
): Context => {
  const context: Context = pick({ exited: false, ...presetContext, ...userContext }, [
    'env',
    'argv',
    'console',
    'exit',
    'exited',
  ])

  const contextExit = context.exit

  const exit =
    contextExit === undefined
      ? async () => {
          context.exited = true
        }
      : async (code?: number) => {
          context.exited = true

          await contextExit(code)
        }

  context.exit = exit

  return context
}

export const composeFactory =
  (presetContext: Omit<Context, 'exited'>): Compose =>
  <T extends Command>(command: T, _settings: Partial<Settings> = {}) => {
    assert.command(command)

    const settings: Settings = defaults({ ..._settings }, { help: true, split: ':' })

    const intents = listIntent(extract(command))

    return async (userContext = {}): Promise<void> => {
      // TODO: assert user context

      const context = defaultContext(presetContext, userContext)

      try {
        const match = matchIntent(intents, context)

        if (match === undefined || match._.length > 0) {
          // TODO: print did you mean?
          const suggestion = suggest(match === undefined ? context.argv : match._, intents)

          await help({
            commands: suggestion === undefined ? [command] : suggestion.commands,
            context,
            settings,
          })

          await context.exit(1)
        } else {
          const command = match.commands.slice(-1)[0]

          const valuesInput: Array<{
            [x: string]: unknown
          }> = []

          let inputIndex = 0

          while (inputIndex < command[SYMBOL_STATE].inputs.length) {
            if (context.exited) {
              return
            }

            const input = command[SYMBOL_STATE].inputs[inputIndex]

            const state = input[SYMBOL_STATE]
            const log = input[SYMBOL_LOG]

            const values = getOptionsVariables(state, match)

            const properties: InputProperties = {
              commands: match.commands,
              context,
              model: {
                log,
                state,
              },
              settings,
            }

            valuesInput.push({
              [input[SYMBOL_STATE].reference!]: await input[SYMBOL_STATE].reducer(
                values,
                properties as unknown as any,
              ),
            })

            inputIndex++
          }

          let commandIndex = 0
          let valuePrevious: any = assign({}, ...valuesInput)

          while (commandIndex < match.commands.length) {
            if (context.exited) {
              return
            }

            commandIndex++

            const currentCommand = match.commands[match.commands.length - commandIndex]

            const valueNext = omit(
              commandIndex === 1
                ? assign({}, valuePrevious)
                : {
                    reference:
                      match.commands[match.commands.length - commandIndex + 1][SYMBOL_STATE]
                        .reference,
                    value: valuePrevious,
                  },
              [PLACEHOLDER_REFERENCES.INPUT],
            )

            valuePrevious = await currentCommand[SYMBOL_STATE].reducer(valueNext, {
              commands: match.commands,
              context,
              model: {
                log: currentCommand[SYMBOL_LOG],
                state: currentCommand[SYMBOL_STATE],
              },
              settings,
            })
          }
        }
      } catch (error) {
        if (isError(error)) {
          if (error instanceof CliError) {
            const suggestion = suggest(context.argv, intents)

            if (suggestion !== undefined) {
              await help({
                commands: suggestion.commands,
                context,
                settings,
              })
            }

            await context.console.error(capitalize(error.message))
            await context.exit(1)
          } else {
            throw error
          }
        } else {
          throw new Error('Unexpected Error')
        }
      }
    }
  }
