import { intersection, slice, findIndex } from 'lodash-es'
import { SYMBOL_STATE, SYMBOL_LOG } from '@escapace/fluent'
import { type Command, TypeAction } from '../command/types'
import { placeholderInputHelpGroup } from './placeholder-input-help-group'

export const addPlaceholder = (command: Command): Command => {
  const hasFlag =
    intersection(placeholderInputHelpGroup[SYMBOL_STATE].options, command[SYMBOL_STATE].options)
      .length !== 0

  if (hasFlag) {
    return command
  }

  const index = findIndex(command[SYMBOL_LOG], ({ type }) => type === TypeAction.Input)

  return {
    [SYMBOL_LOG]: [
      ...slice(command[SYMBOL_LOG], 0, index),
      { payload: placeholderInputHelpGroup, type: TypeAction.Input },
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

// import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
// import { findIndex, slice, flatMap, intersection } from 'lodash-es'
// import { Command, TypeAction } from '../command/types'
// import { helpCommand } from './help-command'
//
// export const injectHelpCommand = (
//   command: Command
// ): Command => {
//   const hasHelpCommand = intersection(
//     helpCommand[SYMBOL_STATE].names,
//     flatMap(command[SYMBOL_STATE].commands, (subcommand) => subcommand[SYMBOL_STATE].names)
//   ).length !== 0
//
//   if (hasHelpCommand) {
//     return command
//   }
//
//   const index = findIndex(
//     command[SYMBOL_LOG],
//     ({ type }) => type === TypeAction.Subcommand
//   )
//
//   return {
//     [SYMBOL_STATE]: {
//       ...command[SYMBOL_STATE],
//       commands: [...command[SYMBOL_STATE].commands, helpCommand],
//     },
//     [SYMBOL_LOG]: [
//       ...slice(command[SYMBOL_LOG], 0, index),
//       { type: TypeAction.Subcommand, payload: helpCommand },
//       ...slice(command[SYMBOL_LOG], index, command[SYMBOL_LOG].length)
//     ]
//   }
// }
