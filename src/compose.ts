/* eslint-disable @typescript-eslint/no-floating-promises */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assign, compact, defaults, intersection, keys, map } from 'lodash-es'
import { Command } from './command/types'
import {
  GenericOption,
  GenericVariable,
  InputType,
  Reference,
  Settings,
  SettingsEnvironment
} from './types'
import { assert } from './utility/assert'
import { extract } from './utility/extract'
import { listIntents } from './utility/list-intents'
import { matchIntent } from './utility/match-intent'

export const compose = <T extends Command>(
  command: T,
  settings: Partial<Settings> = {}
) => {
  assert.command(command)

  const _settings = defaults({ ...settings }, { help: true })

  const intents = listIntents(extract(command), undefined)

  return async (
    environemntSettings: Partial<SettingsEnvironment> = {}
  ): Promise<void> => {
    const _environmentSettings = defaults(
      { ...environemntSettings },
      { env: process.env, argv: process.argv.slice(2) }
    )

    const match = matchIntent(intents, _environmentSettings)

    if (match === undefined) {
      // TODO: define no match behaviour
      // TODO: help by default
      return
    }

    const command = match.models.slice(-1)[0]

    // TODO: input reducer error handling
    const valuesInput = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      map(command[SYMBOL_STATE].inputs, async (input) => {
        const state = input[SYMBOL_STATE]
        const log = input[SYMBOL_LOG]

        const variables: Array<GenericVariable<string>> = compact(
          intersection(state.variables, keys(match.variables)).map((name) => {
            const value = match.variables[name]
            return value === undefined
              ? undefined
              : {
                  type: InputType.Variable,
                  name,
                  value
                }
          })
        )

        const options: Array<
          GenericOption<string | string[] | number | number[]>
        > = intersection(state.options, keys(match.options)).map((name) => ({
          type: InputType.Option,
          name,
          value: match.options[name]
        }))

        const values = [...options, ...variables]

        const props: any = {
          model: {
            state,
            log
          },
          commands: match.models,
          settings: _settings
        }

        const result = await input[SYMBOL_STATE].reducer(values, props)

        return {
          [input[SYMBOL_STATE].reference as Reference]: result
        }
      })
    )

    let index = 0
    let valuePrevious: any = assign({ _: match.arguments }, ...valuesInput)

    while (index < match.models.length) {
      index++

      const current = match.models[match.models.length - index]

      const valueNext =
        index === 1
          ? assign({}, valuePrevious)
          : {
              reference:
                match.models[match.models.length - index + 1][SYMBOL_STATE]
                  .reference,
              value: valuePrevious
            }

      // TODO: command reducer error handling
      valuePrevious = await current[SYMBOL_STATE].reducer(valueNext, {
        model: {
          state: current[SYMBOL_STATE],
          log: current[SYMBOL_LOG]
        },
        commands: match.models,
        settings: _settings
      })
    }
  }
}
