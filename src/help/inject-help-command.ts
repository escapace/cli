import { difference, some } from 'lodash-es'
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { Command } from '../command/types'
import { helpCommand } from './help-command'

export const injectHelpCommand = (
  command: Command,
  subcommand: Command = helpCommand
): Command => {
  const hasSubcommand = some(
    command[SYMBOL_STATE].commands,
    (cmd) =>
      difference(subcommand[SYMBOL_STATE].names, cmd[SYMBOL_STATE].names)
        .length !== subcommand[SYMBOL_STATE].names.length
  )

  if (hasSubcommand) {
    return command
  }

  return {
    [SYMBOL_STATE]: {
      ...command[SYMBOL_STATE],
      commands: [...command[SYMBOL_STATE].commands, subcommand]
    },
    [SYMBOL_LOG]: command[SYMBOL_LOG]
  }
}
