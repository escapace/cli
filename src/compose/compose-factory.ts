/* eslint-disable @typescript-eslint/no-floating-promises */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assign, capitalize, defaults, isError, omit, pick } from 'lodash-es'
import { Command } from '../command/types'
import { getOptionsVariables } from '../compose/get-options-variables'
import { listIntent } from '../compose/list-intent'
import { matchIntent } from '../compose/match-intent'
import { PLACEHOLDER_REFERENCES } from '../compose/placeholder'
import { CliError } from '../error'
import { help } from '../help/help'
import { Compose, Context, PropsInput, Reference, Settings } from '../types'
import { assert } from '../utility/assert'
import { extract } from '../utility/extract'
import { levenshtein } from '../utility/levenshtein'

export const defaultContext = (
  presetContext: Omit<Context, 'configuration' | 'exited'>,
  userContext: Partial<Context>
): Context => {
  const context: Context = pick(
    { configuration: {}, exited: false, ...presetContext, ...userContext },
    ['env', 'argv', 'console', 'exit', 'configuration', 'exited']
  )

  assert.configuration(context.configuration)

  const contextExit = context.exit

  const exit =
    contextExit === undefined
      ? async () => {
          context.exited = true
        }
      : async (code?: number | undefined) => {
          context.exited = true

          await contextExit(code)
        }

  context.exit = exit

  return context
}

export const composeFactory =
  (presetContext: Omit<Context, 'configuration' | 'exited'>): Compose =>
  <T extends Command>(command: T, _settings: Partial<Settings> = {}) => {
    assert.command(command)

    const settings: Settings = defaults(
      { ..._settings },
      { help: true, split: ':' }
    )

    const intents = listIntent(extract(command))

    return async (userContext = {}): Promise<void> => {
      const context = defaultContext(presetContext, userContext)

      try {
        const match = matchIntent(intents, context)

        if (match === undefined || match._.length > 0) {
          const intent = levenshtein(
            match === undefined ? context.argv : match._,
            intents
          )

          help({
            commands: intent === undefined ? [command] : intent.commands,
            context,
            settings
          })

          context.exit(1)
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

            const props: PropsInput = {
              model: {
                state,
                log
              },
              commands: match.commands,
              context,
              settings
            }

            // TODO: error handling
            valuesInput.push({
              [input[SYMBOL_STATE].reference as Reference]: await input[
                SYMBOL_STATE
              ].reducer(values, props as unknown as any)
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

            const currentCommand =
              match.commands[match.commands.length - commandIndex]

            const valueNext = omit(
              commandIndex === 1
                ? assign({}, valuePrevious)
                : {
                    reference:
                      match.commands[match.commands.length - commandIndex + 1][
                        SYMBOL_STATE
                      ].reference,
                    value: valuePrevious
                  },
              [PLACEHOLDER_REFERENCES.INPUT]
            )

            // TODO: error handling
            valuePrevious = await currentCommand[SYMBOL_STATE].reducer(
              valueNext,
              {
                model: {
                  state: currentCommand[SYMBOL_STATE],
                  log: currentCommand[SYMBOL_LOG]
                },
                commands: match.commands,
                settings,
                context
              }
            )
          }
        }
      } catch (e) {
        if (isError(e)) {
          if (e instanceof CliError) {
            const intent = levenshtein(context.argv, intents)

            if (intent !== undefined) {
              help({
                commands: intent.commands,
                context,
                settings
              })
            }

            await context.console.error(capitalize(e.message))
            await context.exit(1)
          } else {
            throw e
          }
        } else {
          throw new Error('Unexpected Error')
        }
      }
    }
  }
