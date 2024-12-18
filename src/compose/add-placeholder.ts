import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { findIndex, intersection, slice } from 'lodash-es'
import { type Command, CommandTypeAction } from '../command/types'
import { placeholderInputHelpGroup } from './placeholder-input-help-group'

export const addPlaceholderInput = (command: Command): Command => {
  const hasFlag =
    intersection(placeholderInputHelpGroup[SYMBOL_STATE].options, command[SYMBOL_STATE].options)
      .length !== 0

  if (hasFlag) {
    return command
  }

  const index = findIndex(command[SYMBOL_LOG], ({ type }) => type === CommandTypeAction.Input)

  return {
    [SYMBOL_LOG]: [
      ...slice(command[SYMBOL_LOG], 0, index),
      { payload: placeholderInputHelpGroup, type: CommandTypeAction.Input },
      ...slice(command[SYMBOL_LOG], index, command[SYMBOL_LOG].length),
    ],
    [SYMBOL_STATE]: {
      ...command[SYMBOL_STATE],
      inputs: [...command[SYMBOL_STATE].inputs, placeholderInputHelpGroup],
      options: [
        ...command[SYMBOL_STATE].options,
        ...placeholderInputHelpGroup[SYMBOL_STATE].options,
      ],
    },
  }
}

// export const addPlaceholderCommand = (commands: Command[]): Command => {
//   // eslint-disable-next-line typescript/no-non-null-assertion
//   const command = commands.at(-1)!
//
//   const subcommands = flatMap(
//     command[SYMBOL_STATE].commands,
//     (subcommand) => subcommand[SYMBOL_STATE].names,
//   )
//
//   if (subcommands.length === 0 || subcommands.includes(PLACEHOLDER_REFERENCES.NAME)) {
//     return command
//   }
//
//   const index = findIndex(command[SYMBOL_LOG], ({ type }) => type === CommandTypeAction.Subcommand)
//
//   const value = placeholderCommandHelp(commands)
//
//   return {
//     [SYMBOL_LOG]: [
//       ...slice(command[SYMBOL_LOG], 0, index),
//       { payload: value, type: CommandTypeAction.Subcommand },
//       ...slice(command[SYMBOL_LOG], index, command[SYMBOL_LOG].length),
//     ],
//     [SYMBOL_STATE]: {
//       ...command[SYMBOL_STATE],
//       commands: [...command[SYMBOL_STATE].commands, value],
//     },
//   }
// }
