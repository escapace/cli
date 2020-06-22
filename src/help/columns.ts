/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { filter, flatten, includes, max, repeat, zipWith } from 'lodash-es'
import stringWidth from 'string-width'
import { HelpOptions } from '../types'
import { joinLines } from './join-lines'
import { wrap } from './wrap'

export const columns = (
  values: Array<[string, string | undefined, number | undefined]>,
  options: HelpOptions
) => {
  const spacing = Math.min(Math.max(Math.floor(options.width / 16), 5), 12)
  const leftEstimate = options.width - Math.floor(options.width / options.ratio)

  const widthBig = Math.floor(spacing / options.ratio)
  const widthSmall = spacing - Math.floor(spacing / options.ratio)
  const spaceBig = repeat(' ', widthBig)
  const spaceSmall = repeat(' ', widthSmall)

  const leftStrings: string[][] = []
  const leftStringsLabelIndexes: number[] = []

  values.forEach((value, index) => {
    const depth = (value[2] ?? 0) + 1

    if (value[1] === undefined) {
      leftStrings.push([
        wrap(value[0], {
          ...options,
          width: options.width,
          indent: repeat(spaceSmall, depth)
        })
      ])

      leftStringsLabelIndexes.push(index)
    } else {
      const result = wrap(value[0], {
        ...options,
        width: leftEstimate,
        indent: repeat(spaceSmall, depth)
      })
        .split(options.newline)
        .map((str) => `${str}${spaceBig}`)

      leftStrings.push(result)
    }
  })

  const leftWidth = max(
    flatten(
      filter(
        leftStrings,
        (_, index) => !includes(leftStringsLabelIndexes, index)
      )
    ).map((str) => stringWidth(str))
  )!

  // TODO: single table mode
  // if (leftWidth > leftEstimate) {
  //   console.log('Failed', leftWidth, leftEstimate)
  // }

  const rightStrings: string[][] = values.map((value) => {
    const width = options.width - leftWidth

    return value[1] === undefined
      ? ['']
      : wrap(value[1], { ...options, width }).split(options.newline)
  })

  return flatten(
    zipWith(leftStrings, rightStrings, (a, b) => [
      ...joinLines(a, b, leftWidth),
      ''
    ])
  )
}
