/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PropsShared } from '../types'
import { map, last } from 'lodash-es'
import { SYMBOL_STATE } from '@escapace/fluent'

export const renderHelp = (props: PropsShared): void => {
  const command = last(props.commands)!
  // const hasSubcommands = command[SYMBOL_STATE].commands.length !== 0

  console.log({
    argv: map(props.commands, (cmd) => cmd[SYMBOL_STATE].names[0]),
    description: command[SYMBOL_STATE].description,
    commands: map(command[SYMBOL_STATE].commands, (command) => ({
      name: command[SYMBOL_STATE].names[0],
      description: command[SYMBOL_STATE].description
    })),
    inputs: map(command[SYMBOL_STATE].inputs, (input) => ({
      options: input[SYMBOL_STATE].options,
      variables: input[SYMBOL_STATE].variables,
      description: input[SYMBOL_STATE].description!
    }))
  })
}
