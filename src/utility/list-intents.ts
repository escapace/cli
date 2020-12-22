import { SYMBOL_STATE } from '@escapace/fluent'
import { flatMap, map, union } from 'lodash-es'
import { Command } from '../command/types'
import { injectHelpCommand } from '../help/inject-help-command'
import { injectHelpInput } from '../help/inject-help-input'
import { Intent } from '../types'
import { spec } from './spec'

const enum CommandType {
  RootCommandWithSubcommands,
  RootCommandWithoutSubcommands,
  CommandWithSubcommands,
  CommandWithoutSubcommands
}

export const listIntents = (command: Command, _intent?: Intent): Intent[] => {
  const isRoot = _intent === undefined
  const intent: Intent = isRoot
    ? { models: [], commands: [], spec: {} }
    : (_intent as Intent)
  const hasSubcommands = command[SYMBOL_STATE].commands.length !== 0

  const commandType = isRoot
    ? hasSubcommands
      ? CommandType.RootCommandWithSubcommands
      : CommandType.RootCommandWithoutSubcommands
    : hasSubcommands
    ? CommandType.CommandWithSubcommands
    : CommandType.CommandWithoutSubcommands

  const walkSubcommands = (name?: string) => {
    const _command = injectHelpCommand(command)

    return flatMap(_command[SYMBOL_STATE].commands, (value) =>
      listIntents(value, {
        spec: intent.spec,
        commands:
          name === undefined
            ? [...intent.commands]
            : [...intent.commands, name],
        models: union(intent.models, [_command])
      })
    )
  }

  switch (commandType) {
    case CommandType.RootCommandWithSubcommands:
      return walkSubcommands()
    case CommandType.CommandWithSubcommands:
      return flatMap(command[SYMBOL_STATE].names, (name) =>
        walkSubcommands(name)
      )
    case CommandType.RootCommandWithoutSubcommands:
      return [
        {
          commands: intent.commands,
          models: union(intent.models, [command]),
          spec: spec(injectHelpInput(command))
        }
      ]
    case CommandType.CommandWithoutSubcommands:
      return map(command[SYMBOL_STATE].names, (name) => ({
        commands: [...intent.commands, name],
        models: union(intent.models, [command]),
        spec: spec(injectHelpInput(command))
      }))
  }
}
