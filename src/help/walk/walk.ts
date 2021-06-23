/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { assign, last, map } from 'lodash-es'
import { PropsShared } from '../../types'
import { Help, HelpType } from '../types'
import { walkCommands } from './walk-commands'
import { walkInputs } from './walk-inputs'

export const walk = (props: PropsShared): Help => {
  const { commands } = props
  const command = last(commands)!
  const hasSubcommands = command[SYMBOL_STATE].commands.length !== 0

  return assign(
    {
      argv: map(commands, (cmd) => cmd[SYMBOL_STATE].names[0]),
      description: command[SYMBOL_STATE].description!
    },
    hasSubcommands
      ? {
          type: HelpType.Commands as const,
          commands: walkCommands(command[SYMBOL_STATE].commands)
        }
      : {
          type: HelpType.Inputs as const,
          inputs: walkInputs(props, command[SYMBOL_STATE].inputs)
        }
  )
}
