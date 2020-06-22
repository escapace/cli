/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { map } from 'lodash-es'
import { Command } from '../../command/types'
import { HelpCommands } from '../types'

export const walkCommands = (commands: Command[]): HelpCommands['commands'] => {
  return map(commands, (command) => ({
    name: command[SYMBOL_STATE].names[0],
    description: command[SYMBOL_STATE].description!
  }))
}
