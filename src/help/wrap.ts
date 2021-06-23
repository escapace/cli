/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { join } from 'lodash-es'
import stringWidth from 'string-width'
import wrapAnsi from 'wrap-ansi'
import { HelpOptions } from '../types'

export const wrap = (string: string, options: HelpOptions): string => {
  const { width, indent, newline } = options

  const noIndent = indent === ''

  const strings = wrapAnsi(
    string,
    noIndent ? width : width - stringWidth(indent),
    { hard: true }
  )

  if (indent === '') {
    return strings
  } else {
    return join(
      strings.split(newline).map((str) => `${indent}${str}`),
      newline
    )
  }
}
