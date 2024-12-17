/* eslint-disable typescript/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { assign, last, map } from 'lodash-es'
import type { PropertiesShared } from '../../types'
import { type Help, HelpType } from '../types'
import { walkCommands } from './walk-commands'
import { walkInputs } from './walk-inputs'

export const walk = (properties: PropertiesShared): Help => {
  const { commands } = properties
  const command = last(commands)!
  const hasSubcommands = command[SYMBOL_STATE].commands.length !== 0

  return assign(
    {
      argv: map(commands, (cmd) => cmd[SYMBOL_STATE].names[0]),
      description: command[SYMBOL_STATE].description!,
    },
    hasSubcommands
      ? {
          commands: walkCommands(command[SYMBOL_STATE].commands),
          type: HelpType.Commands as const,
        }
      : {
          inputs: walkInputs(properties, command[SYMBOL_STATE].inputs),
          type: HelpType.Inputs as const,
        },
  )
}
