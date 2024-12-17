import { repeat } from 'lodash-es'
import { space } from './space'

export const joinLines = (aa: string[], bb: string[], max: number): string[] => {
  const strings: string[] = []

  let index = 0
  const arrayLength = aa.length >= bb.length ? aa.length : bb.length

  while (index < arrayLength) {
    const a = aa[index] === undefined ? repeat(' ', max) : space(aa[index], max)
    const b = bb[index] ?? ''

    strings.push(`${a}${b}`)

    index++
  }

  return strings
}
