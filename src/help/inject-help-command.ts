import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { findIndex, slice, some, difference } from 'lodash-es'
import { Command, TypeAction } from '../command/types'
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

  const index = findIndex(
    command[SYMBOL_LOG],
    ({ type }) => type === TypeAction.Subcommand
  )

  return {
    [SYMBOL_STATE]: {
      ...command[SYMBOL_STATE],
      commands: [...command[SYMBOL_STATE].commands, subcommand]
    },
    [SYMBOL_LOG]: [
      ...slice(command[SYMBOL_LOG], 0, index),
      { type: TypeAction.Subcommand, payload: subcommand },
      ...slice(command[SYMBOL_LOG], index, command[SYMBOL_LOG].length)
    ]
  }
}
