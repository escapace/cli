import { repeat } from 'lodash-es'
import stringWidth from 'string-width'

export const space = (string_: string, length: number): string => {
  const w = stringWidth(string_)

  return w >= length ? string_ : `${string_}${repeat(' ', length - w)}`
}
