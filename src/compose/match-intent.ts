/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import arg from 'arg'
import { xor, omitBy, pick, map, get, slice } from 'lodash-es'
import { Intent, Match, Context } from '../types'

export const matchIntent = (
  intents: Intent[],
  context: Context
): Match | undefined => {
  let match: Match | undefined
  let index = 0

  while (index < intents.length) {
    const intent = intents[index]

    // TODO: catch error
    // TODO: do spec here?
    const options: Record<
      string,
      boolean | string | number | string[] | number[] | undefined
    > & { _: string[] } = arg(intent.specification, {
      permissive: true,
      argv: context.argv
    })

    const variables = pick(
      context.env,
      intent.commands.slice(-1)[0][SYMBOL_STATE].variables
    )

    if (xor(intent._, options._).length === 0) {
      match = {
        options: omitBy(
          options,
          (value, key) => key === '_' || value === undefined
        ) as Record<string, string | number | string[] | number[]>,
        variables,
        _: options._.slice(intent._.length),
        commands: intent.commands,
        configuration:
          intent.commands.length === 1
            ? context.configuration
            : get(
                context.configuration,
                map(
                  slice(intent.commands, 1),
                  (command) => command[SYMBOL_STATE].reference!
                )
              )
      }

      break
    } else {
      index++
    }
  }

  return match
}
