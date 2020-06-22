import { repeat } from 'lodash-es'
import stringWidth from 'string-width'

export const space = (str: string, len: number): string => {
  const w = stringWidth(str)

  return w >= len ? str : `${str}${repeat(' ', len - w)}`
}
