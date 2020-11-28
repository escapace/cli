import $ from '@escapace/typelevel'
import { find, isUndefined } from 'lodash-es'

export const fallback = <T, U extends unknown[]>(
  fallback: T,
  ...values: U
): T | Exclude<$.Values<U>, undefined> => {
  const found = find(values, (value) => !isUndefined(value))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (isUndefined(found) ? fallback : found) as any
}
