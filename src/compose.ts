/* eslint-disable @typescript-eslint/no-floating-promises */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import arg, { Handler, Spec } from 'arg'
import {
  assign,
  defaults,
  difference,
  filter,
  flatMap,
  intersection,
  keys,
  map,
  omit,
  pick,
  union
} from 'lodash-es'
import {
  InputType,
  Reference,
  Settings,
  SYMBOL_INPUT_BOOLEAN,
  SYMBOL_INPUT_CHOICE,
  SYMBOL_INPUT_COUNT,
  SYMBOL_INPUT_STRING
} from './types'
import { extract } from './utility/extract'
import { ActionInput, Command, Input, TypeAction } from './command/types'
import { assert } from './utility/assert'
import { injectHelpInput } from './help/inject-help-input'
import { injectHelpCommand } from './help/inject-help-command'

// TODO: Better return type in TypeScript 4.0
// Array<Array<Command | Input>>

const match = (input: Input): string | Handler | [Handler] => {
  const state = input[SYMBOL_STATE]

  switch (state.type) {
    case SYMBOL_INPUT_BOOLEAN:
      return Boolean
    case SYMBOL_INPUT_CHOICE:
      return state.repeat ? [String] : String
    case SYMBOL_INPUT_COUNT:
      return arg.COUNT
    case SYMBOL_INPUT_STRING:
      return state.repeat ? [String] : String
  }
}

const spec = (command: Command): Spec => {
  const log = command[SYMBOL_LOG]

  return assign(
    {},
    ...map(
      filter(log, ({ type }) => type === TypeAction.Input) as ActionInput[],
      ({ payload }): Spec => {
        const type = match(payload)
        const options = payload[SYMBOL_STATE].options

        return assign({}, ...map(options, (option) => ({ [option]: type })))
      }
    )
  )
}

interface Choice {
  models: Command[]
  commands: string[]
  spec: Spec
}

type Iterate = (command: Command, choice?: Choice) => Choice[]

const walkSubcommands = (command: Command, choice: Choice, name?: string) =>
  flatMap(command[SYMBOL_STATE].commands, (value) =>
    iterate(value, {
      spec: choice.spec,
      commands:
        name === undefined ? [...choice.commands] : [...choice.commands, name],
      models: union(choice.models, [command])
    })
  )

enum CommandType {
  RootCommandWithSubcommands,
  RootCommandWithoutSubcommands,
  CommandWithSubcommands,
  CommandWithoutSubcommands
}

const iterate: Iterate = (command, _choice) => {
  const isRoot = _choice === undefined
  const choice: Choice = isRoot
    ? { models: [], commands: [], spec: {} }
    : (_choice as Choice)
  const hasSubcommands = command[SYMBOL_STATE].commands.length !== 0

  const commandType = isRoot
    ? hasSubcommands
      ? CommandType.RootCommandWithSubcommands
      : CommandType.RootCommandWithoutSubcommands
    : hasSubcommands
    ? CommandType.CommandWithSubcommands
    : CommandType.CommandWithoutSubcommands

  switch (commandType) {
    case CommandType.RootCommandWithSubcommands:
      return walkSubcommands(injectHelpCommand(command), choice)
    case CommandType.CommandWithSubcommands:
      return flatMap(command[SYMBOL_STATE].names, (name) =>
        walkSubcommands(injectHelpCommand(command), choice, name)
      )
    case CommandType.RootCommandWithoutSubcommands:
      return [
        {
          commands: choice.commands,
          models: union(choice.models, [command]),
          spec: spec(injectHelpInput(command))
        }
      ]
    case CommandType.CommandWithoutSubcommands:
      return map(command[SYMBOL_STATE].names, (name) => ({
        commands: [...choice.commands, name],
        models: union(choice.models, [command]),
        spec: spec(injectHelpInput(command))
      }))
  }
}

interface Task {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: Record<string, any>
  variables: Record<string, string | undefined>
  arguments: string[]
  models: Command[]
}

const lookup = (choices: Choice[], settings: Settings): Task | undefined => {
  let task: Task | undefined
  let index = 0

  while (index < choices.length) {
    const choice = choices[index]

    const options = arg(choice.spec, {
      permissive: true,
      argv: settings.argv
    })

    const variables = pick(
      settings.env,
      choice.models.slice(-1)[0][SYMBOL_STATE].variables
    )

    if (difference(choice.commands, options._).length === 0) {
      task = {
        options: omit(options, ['_']),
        variables,
        arguments: options._.slice(choice.commands.length),
        models: choice.models
      }

      break
    } else {
      index++
    }
  }

  return task
}

export const compose = <T extends Command>(command: T) => {
  assert.command(command)
  const choices = iterate(extract(command))

  console.log(choices)

  return async (settings: Partial<Settings> = {}): Promise<void> => {
    const _settings = defaults(
      { ...settings },
      { env: process.env, argv: process.argv.slice(2) }
    )

    const task = lookup(choices, _settings)

    if (task === undefined) {
      // TODO: define no match behaviour
      return
    }

    const command = task.models.slice(-1)[0]

    // TODO: input reducer error handling
    const valuesInput = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      map(command[SYMBOL_STATE].inputs, (input) => {
        const state = input[SYMBOL_STATE]
        const log = input[SYMBOL_LOG]

        const values = [
          ...intersection(state.options, keys(task.options)).map((name) => ({
            type: InputType.Option,
            name,
            value: task.options[name]
          })),
          ...intersection(state.variables, keys(task.variables)).map(
            (name) => ({
              type: InputType.Variable,
              name,
              value: task.variables[name]
            })
          )
        ]

        const fn: Function = input[SYMBOL_STATE].reducer

        return new Promise((resolve, reject) => {
          try {
            const value = fn(values, { state, log })

            resolve(value)
          } catch (e) {
            reject(e)
          }
        }).then((value) => ({
          [input[SYMBOL_STATE].reference as Reference]: value
        }))
      })
    )

    let index = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let valuePrevious: any = assign({ _: task.arguments }, ...valuesInput)

    while (index < task.models.length) {
      index++

      const current = task.models[task.models.length - index]

      const valueNext =
        index === 1
          ? assign({}, valuePrevious)
          : {
              reference:
                task.models[task.models.length - index + 1][SYMBOL_STATE]
                  .reference,
              value: valuePrevious
            }

      // TODO: command reducer error handling
      valuePrevious = await current[SYMBOL_STATE].reducer(valueNext, {
        state: current[SYMBOL_STATE],
        log: current[SYMBOL_LOG]
      })
    }
  }
}
