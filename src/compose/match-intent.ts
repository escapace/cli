import { SYMBOL_STATE } from '@escapace/fluent'
import arg from 'arg'
import { xor, omitBy, pick } from 'lodash-es'
import { Intent, Match, Context } from '../types'

export const matchIntent = (
  intents: Intent[],
  context: Context
): Match | undefined => {
  let task: Match | undefined
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
      task = {
        options: omitBy(
          options,
          (value, key) => key === '_' || value === undefined
        ) as Record<string, string | number | string[] | number[]>,
        variables,
        _: options._.slice(intent._.length),
        commands: intent.commands
      }

      break
    } else {
      index++
    }
  }

  return task
}
