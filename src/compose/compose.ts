/* eslint-disable @typescript-eslint/no-floating-promises */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import {
  assign,
  compact,
  defaults,
  intersection,
  keys,
  map,
  omit
} from 'lodash-es'
import { Command } from '../command/types'
import { InputBooleanState } from '../input/boolean/types'
import { InputChoiceState } from '../input/choice/types'
import { InputCountState } from '../input/count/types'
import { InputGroupState } from '../input/group/types'
import { InputStringState } from '../input/string/types'
import {
  GenericOption,
  GenericVariable,
  InputType,
  Match,
  Reference,
  Settings,
  SettingsEnvironment
} from '../types'
import { assert } from '../utility/assert'
import { extract } from '../utility/extract'
import { listIntent } from './list-intent'
import { matchIntent } from './match-intent'
import { PLACEHOLDER_REFERENCES } from './placeholder'

const abc = (
  state:
    | InputBooleanState
    | InputChoiceState
    | InputCountState
    | InputStringState
    | InputGroupState,
  match: Match
) => {
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
    GenericOption<boolean | string | string[] | number | number[]>
  > = intersection(state.options, keys(match.options)).map((name) => ({
    type: InputType.Option,
    name,
    value: match.options[name]
  }))

  return [...options, ...variables]
}

export const compose = <T extends Command>(
  command: T,
  settings: Partial<Settings> = {}
) => {
  assert.command(command)

  const _settings = defaults({ ...settings }, { help: true })

  // console.time('intent')
  const intents = listIntent(extract(command))
  // console.timeEnd('intent')
  console.log(intents)

  return async (
    environemntSettings: Partial<SettingsEnvironment> = {}
  ): Promise<void> => {
    const _environmentSettings = defaults(
      { ...environemntSettings },
      { env: process.env, argv: process.argv.slice(2) }
    )

    // console.time('match')
    const match = matchIntent(intents, _environmentSettings)
    // console.timeEnd('match')

    if (match === undefined || match._.length > 0) {
      console.log('Fallthrough', match?.commands[0][SYMBOL_STATE].names)
    } else {
      const command = match.commands.slice(-1)[0]

      // TODO: input reducer error handling
      const valuesInput = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        map(command[SYMBOL_STATE].inputs, async (input) => {
          const state = input[SYMBOL_STATE]
          const log = input[SYMBOL_LOG]

          const values = abc(state, match)

          const props: any = {
            model: {
              state,
              log
            },
            commands: match.commands,
            settings: _settings
          }

          const result = await input[SYMBOL_STATE].reducer(values, props)

          return {
            [input[SYMBOL_STATE].reference as Reference]: result
          }
        })
      )

      let index = 0
      let valuePrevious: any = assign({}, ...valuesInput)

      while (index < match.commands.length) {
        index++

        const current = match.commands[match.commands.length - index]

        const valueNext = omit(
          index === 1
            ? assign({}, valuePrevious)
            : {
                reference:
                  match.commands[match.commands.length - index + 1][
                    SYMBOL_STATE
                  ].reference,
                value: valuePrevious
              },
          [PLACEHOLDER_REFERENCES.INPUT]
        )

        // TODO: command reducer error handling
        valuePrevious = await current[SYMBOL_STATE].reducer(valueNext, {
          // _: match._,
          model: {
            state: current[SYMBOL_STATE],
            log: current[SYMBOL_LOG]
          },
          commands: match.commands,
          settings: _settings
        })
      }
    }
  }
}
