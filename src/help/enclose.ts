import { join } from 'lodash-es'

export const enclose = (arr: string[]): string =>
  `${arr.length === 1 ? arr[0] : `(${join(arr, '|')})`}`
