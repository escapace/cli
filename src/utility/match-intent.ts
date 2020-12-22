import { SYMBOL_STATE } from '@escapace/fluent'
import arg from 'arg'
import { difference, omitBy, pick } from 'lodash-es'
import { Intent, Match, SettingsEnvironment } from '../types'

export const matchIntent = (
  intents: Intent[],
  settings: SettingsEnvironment
): Match | undefined => {
  let task: Match | undefined
  let index = 0

  while (index < intents.length) {
    const intent = intents[index]

    // TODO: do spec here?
    const options: Record<
      string,
      string | number | string[] | number[] | undefined
    > & { _: string[] } = arg(intent.spec, {
      permissive: true,
      argv: settings.argv
    })

    const variables = pick(
      settings.env,
      intent.models.slice(-1)[0][SYMBOL_STATE].variables
    )

    if (difference(intent.commands, options._).length === 0) {
      task = {
        options: omitBy(
          options,
          (value, key) => key === '_' || value === undefined
        ) as Record<string, string | number | string[] | number[]>,
        variables,
        arguments: options._.slice(intent.commands.length),
        models: intent.models
      }

      break
    } else {
      index++
    }
  }

  return task
}
