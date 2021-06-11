/* eslint-disable @typescript-eslint/no-floating-promises */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assign, defaults, omit, pick } from 'lodash-es'
import { Command } from '../command/types'
import { Compose, Context, PropsInput, Reference, Settings } from '../types'
import { assert } from '../utility/assert'
import { extract } from '../utility/extract'
import { getOptionsVariables } from '../compose/get-options-variables'
import { listIntent } from '../compose/list-intent'
import { matchIntent } from '../compose/match-intent'
import { PLACEHOLDER_REFERENCES } from '../compose/placeholder'

export const composeFactory =
  (context: Context): Compose =>
  <T extends Command>(command: T, settings: Partial<Settings> = {}) => {
    assert.command(command)

    // console.time('intent')
    const intents = listIntent(extract(command))
    // console.timeEnd('intent')
    // console.log(intents)

    const contextGlobal = context

    return async (context: Partial<Context> = {}): Promise<void> => {
      let exitBoolean = false

      const contextLocal = context

      const _settings = defaults({ ...settings }, { help: true })

      const ctx: Context = pick({ ...contextGlobal, ...contextLocal }, [
        'env',
        'argv',
        'console',
        'exit'
      ])

      const contextExit = ctx.exit

      const exit =
        contextExit === undefined
          ? () => {
              exitBoolean = true
            }
          : (code?: number | undefined) => {
              exitBoolean = true

              contextExit(code)
            }

      ctx.exit = exit
      // const _context = defaults(
      //   { ..._context },
      //
      // )

      // console.time('match')
      const match = matchIntent(intents, ctx)
      // console.timeEnd('match')

      if (match === undefined || match._.length > 0) {
        console.log('Fallthrough', match?.commands[0][SYMBOL_STATE].names)

        ctx.exit()
      } else {
        const command = match.commands.slice(-1)[0]

        const valuesInput: Array<{
          [x: string]: unknown
        }> = []

        let inputIndex = 0

        while (inputIndex < command[SYMBOL_STATE].inputs.length) {
          if (exitBoolean) {
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
            context: ctx,
            settings: _settings
          }

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
          if (exitBoolean) {
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

          valuePrevious = await currentCommand[SYMBOL_STATE].reducer(
            valueNext,
            {
              // _: match._,
              model: {
                state: currentCommand[SYMBOL_STATE],
                log: currentCommand[SYMBOL_LOG]
              },
              commands: match.commands,
              settings: _settings,
              context: ctx
            }
          )
        }
      }
    }
  }
