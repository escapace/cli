import { SYMBOL_STATE } from '@escapace/fluent'
import { flatMap, map, union } from 'lodash-es'
import { Command } from '../command/types'
import { addPlaceholder } from './add-placeholder'
import { placeholderCommand, PLACEHOLDER_REFERENCES } from './placeholder'
import { Intent } from '../types'
import { getSpecification } from './get-specification'

export const listIntent = (command: Command): Intent[] => {
  const next = (command: Command, intentOrUdefined?: Intent): Intent[] => {
    const hasSubcommands = command[SYMBOL_STATE].commands.length !== 0
    const isRoot = intentOrUdefined === undefined
    const intent: Intent = isRoot
      ? { commands: [], _: [], specification: {} }
      : (intentOrUdefined as Intent)

    if (hasSubcommands) {
      if (isRoot) {
        const placeholder = placeholderCommand([command])

        return [
          ...flatMap(command[SYMBOL_STATE].commands, (value) =>
            next(value, {
              _: intent._,
              commands: [command],
              specification: intent.specification
            })
          ),
          {
            _: [],
            commands: [placeholder],
            specification: getSpecification(placeholder)
          }
        ]
      } else {
        const commands = union(intent.commands, [command])
        const placeholder = placeholderCommand(commands)

        return flatMap(command[SYMBOL_STATE].names, (name) =>
          flatMap(command[SYMBOL_STATE].commands, (value) => [
            ...next(value, {
              _: [...intent._, name],
              commands,
              specification: intent.specification
            }),
            {
              _: [...intent._, name],
              commands: [placeholder],
              specification: getSpecification(placeholder)
            }
          ])
        )
      }
    } else {
      const withPlaceholder =
        command[SYMBOL_STATE].reference === PLACEHOLDER_REFERENCES.COMMAND
          ? command
          : addPlaceholder(command)

      const commands = union(intent.commands, [withPlaceholder])
      const specification = getSpecification(withPlaceholder)

      if (isRoot) {
        return [
          {
            _: intent._,
            commands,
            specification
          }
        ]
      } else {
        return map(command[SYMBOL_STATE].names, (name) => ({
          _: [...intent._, name],
          commands,
          specification
        }))
      }
    }
  }

  return next(command)
}
