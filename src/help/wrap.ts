import { join } from 'lodash-es'
import stringWidth from 'string-width'
import wrapAnsi from 'wrap-ansi'
import type { HelpOptions } from '../types'

export const wrap = (string: string, options: HelpOptions): string => {
  const { indent, newline, width } = options

  const noIndent = indent === ''

  const strings = wrapAnsi(string, noIndent ? width : width - stringWidth(indent), { hard: true })

  return indent === ''
    ? strings
    : join(
        strings.split(newline).map((string_) => `${indent}${string_}`),
        newline,
      )
}
