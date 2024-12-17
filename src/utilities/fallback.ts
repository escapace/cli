import type $ from '@escapace/typelevel'
import { find, isUndefined } from 'lodash-es'

export const fallback = <T, U extends unknown[]>(
  fallback: T,
  ...values: U
): Exclude<$.Values<U>, undefined> | T => {
  const found = find(values, (value) => !isUndefined(value))

  return (isUndefined(found) ? fallback : found) as Exclude<$.Values<U>, undefined> | T
}
