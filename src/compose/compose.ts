/* eslint-disable @typescript-eslint/no-floating-promises */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assign, compact, defaults, intersection, keys, omit } from 'lodash-es'
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

  // console.time('intent')
  const intents = listIntent(extract(command))
  // console.timeEnd('intent')
  console.log(intents)

  return async (
    environemntSettings: Partial<SettingsEnvironment> = {}
  ): Promise<void> => {
    let exitBoolean = false

    const exit = () => {
      exitBoolean = true
    }

    const _settings = defaults({ ...settings }, { help: console.log, exit })

    const _environmentSettings = defaults(
      { ...environemntSettings },
      { env: process.env, argv: process.argv.slice(2) }
    )

    // console.time('match')
    const match = matchIntent(intents, _environmentSettings)
    // console.timeEnd('match')

    if (match === undefined || match._.length > 0) {
      console.log('Fallthrough', match?.commands[0][SYMBOL_STATE].names)
      exit()
    } else {
      const command = match.commands.slice(-1)[0]

      // TODO: error handling
      // TODO: replace Promise all map with a while structure
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

        const values = abc(state, match)

        const props: any = {
          model: {
            state,
            log
          },
          commands: match.commands,
          settings: _settings
        }

        valuesInput.push({
          [input[SYMBOL_STATE].reference as Reference]: await input[
            SYMBOL_STATE
          ].reducer(values, props)
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

        // TODO: command reducer error handling
        valuePrevious = await currentCommand[SYMBOL_STATE].reducer(valueNext, {
          // _: match._,
          model: {
            state: currentCommand[SYMBOL_STATE],
            log: currentCommand[SYMBOL_LOG]
          },
          commands: match.commands,
          settings: _settings
        })
      }
    }
  }
}
