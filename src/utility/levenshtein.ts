import { join, map, minBy } from 'lodash-es'
import { Intent } from '../types'

const distance = (a: string, b: string): number => {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  if (a[0] === b[0]) return distance(a.substring(1), b.substring(1))

  return (
    1 +
    Math.min(
      distance(a, b.substring(1)),
      distance(a.substring(1), b),
      distance(a.substring(1), b.substring(1))
    )
  )
}

export const levenshtein = (argv: string[], intents: Intent[]) => {
  const string = join(argv, ' ')

  return minBy(
    map(intents, (intent) => ({
      distance: distance(join(intent._, ' '), string),
      ...intent
    })),
    (value) => value.distance
  )
}
