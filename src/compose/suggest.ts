import { SYMBOL_STATE } from '@escapace/fluent'
import { filter, join, map, minBy } from 'lodash-es'
import { PLACEHOLDER_REFERENCES, type Intent } from '../types'
import { levenshtein } from '../utilities/levenshtein'

export const suggest = (argv: string[], intents: Intent[]) => {
  const string = join(argv, ' ')

  return minBy(
    map(
      filter(
        intents,
        (intent) => intent.commands[0][SYMBOL_STATE].reference !== PLACEHOLDER_REFERENCES.COMMAND,
      ),
      (intent) => ({
        distance: levenshtein(join(intent._, ' '), string),
        ...intent,
      }),
    ),
    (value) => value.distance,
  )
}
