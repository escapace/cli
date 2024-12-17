import { join } from 'lodash-es'

export const enclose = (array: string[]): string =>
  `${array.length === 1 ? array[0] : `(${join(array, '|')})`}`
