import { SYMBOL_STATE } from '@escapace/fluent'
import { filter, join, minBy } from 'lodash-es'
import { PLACEHOLDER_REFERENCES, type Intent } from '../types'
import { levenshtein } from '../utilities/levenshtein'

export const suggest = (argv: string[], intents: Intent[]) => {
  const string = join(argv, ' ')

  return minBy(
    filter(
      intents,
      (intent) =>
        !intent.commands.every(
          (value) => value[SYMBOL_STATE].reference === PLACEHOLDER_REFERENCES.COMMAND,
        ),
    ),
    (value) => levenshtein(join(value._, ' '), string),
  )
}
