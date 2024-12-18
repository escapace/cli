import { SYMBOL_STATE } from '@escapace/fluent'
import { flatMap, map } from 'lodash-es'
import type { Command } from '../command/types'
import { PLACEHOLDER_REFERENCES, type Intent } from '../types'
import { addPlaceholderInput } from './add-placeholder'
import { getSpecification } from './get-specification'
import { placeholderCommandHelp } from './placeholder-command-help'

export const listIntent = (command: Command): Intent[] => {
  const next = (command: Command, intentOrUdefined?: Intent): Intent[] => {
    const hasSubcommands = command[SYMBOL_STATE].commands.length !== 0
    const isRoot = intentOrUdefined === undefined
    const intent: Intent = isRoot ? { _: [], commands: [], specification: {} } : intentOrUdefined

    if (hasSubcommands) {
      if (isRoot) {
        const placeholder = placeholderCommandHelp([command])

        return [
          ...flatMap(command[SYMBOL_STATE].commands, (value) =>
            next(value, {
              _: intent._,
              commands: [command],
              specification: intent.specification,
            }),
          ),
          {
            _: [],
            commands: [placeholder],
            specification: getSpecification(placeholder),
          },
        ]
      } else {
        const commands = [...intent.commands, command]
        const placeholder = placeholderCommandHelp(commands)

        return flatMap(command[SYMBOL_STATE].names, (name) =>
          flatMap(command[SYMBOL_STATE].commands, (value) => [
            ...next(value, {
              _: [...intent._, name],
              commands,
              specification: intent.specification,
            }),
            {
              _: [...intent._, name],
              commands: [placeholder],
              specification: getSpecification(placeholder),
            },
          ]),
        )
      }
    } else {
      const withPlaceholder =
        command[SYMBOL_STATE].reference === PLACEHOLDER_REFERENCES.COMMAND
          ? command
          : addPlaceholderInput(command)

      const commands = [...intent.commands, withPlaceholder]
      const specification = getSpecification(withPlaceholder)

      return isRoot
        ? [
            {
              _: intent._,
              commands,
              specification,
            },
          ]
        : map(command[SYMBOL_STATE].names, (name) => ({
            _: [...intent._, name],
            commands,
            specification,
          }))
    }
  }

  return next(command)
}
