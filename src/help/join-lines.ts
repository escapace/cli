import { repeat } from 'lodash-es'
import { space } from './space'

export const joinLines = (
  aa: string[],
  bb: string[],
  max: number
): string[] => {
  const strings: string[] = []

  let i = 0
  const arrayLength = aa.length >= bb.length ? aa.length : bb.length

  while (i < arrayLength) {
    const a = aa[i] === undefined ? repeat(' ', max) : space(aa[i], max)
    const b = bb[i] === undefined ? '' : bb[i]

    strings.push(`${a}${b}`)

    i++
  }

  return strings
}
