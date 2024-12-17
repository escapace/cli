/* eslint-disable typescript/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { map } from 'lodash-es'
import type { Command } from '../../command/types'
import type { HelpCommands } from '../types'

export const walkCommands = (commands: Command[]): HelpCommands['commands'] =>
  map(commands, (command) => ({
    description: command[SYMBOL_STATE].description!,
    name: command[SYMBOL_STATE].names[0],
  }))
