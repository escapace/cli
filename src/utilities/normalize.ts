import { map } from 'lodash-es'
import split from 'split-string'
import type { InputChoiceProperties } from '../input/choice/types'
import type { InputNumberProperties } from '../input/number/types'
import type { InputStringProperties } from '../input/string/types'
import {
  type DeNormalizedNumberValue,
  type DeNormalizedStringValue,
  type GenericOption,
  type GenericVariable,
  InputType,
  type NormalizedNumberValue,
  type NormalizedStringValue,
  type Settings,
} from '../types'
import { trimWhitespace, unquote } from './unquote'

function trimArrayWhitespace(array: string[]): string[] {
  // Remove excess whitespace and newline strings from the beginning
  while (array.length > 0 && /^\p{Z}*$/u.test(array[0])) {
    array.shift()
  }

  // Remove excess whitespace and newline strings from the end
  while (array.length > 0 && /^\p{Z}*$/u.test(array[array.length - 1])) {
    array.pop()
  }

  return array
}

const normalizeVariableString = (
  value: string,
  options: {
    repeat: boolean
  } & Pick<Settings, 'quotes' | 'separator'>,
): string[] => {
  const lines = trimArrayWhitespace(value.split(/\r?\n/))

  if (lines.length > 1) {
    return [lines.join('\n')]
  }

  const string = lines[0] ?? ''

  if (!options.repeat) {
    return [unquote(trimWhitespace(string), options.quotes)]
  }

  return split(string, { quotes: options.quotes, separator: options.separator }).map((value) =>
    unquote(value, options.quotes),
  )
}

const normalizeVariableNumber = (
  value: string,
  options: {
    repeat: boolean
  } & Pick<Settings, 'quotes' | 'separator'>,
): number[] => {
  const initial = value.replaceAll(/\p{Z}/gu, '')

  const numbers = (
    options.repeat
      ? split(initial, {
          quotes: options.quotes,
          separator: options.separator,
        })
      : [initial]
  )
    .map((value) => unquote(value, options.quotes).replaceAll(/[^\p{N}.]/gu, ''))
    .map((value) => (value.includes('.') ? parseFloat(value) : parseInt(value, 10)))

  return numbers
}

export function normalizeString(
  previousValues: DeNormalizedStringValue[],
  properties: InputChoiceProperties | InputStringProperties,
): NormalizedStringValue[] {
  const { repeat } = properties.model.state

  return map(previousValues, (previousValue) => {
    if (previousValue.type === InputType.Option) {
      return repeat
        ? map(
            previousValue.value as string[],
            (value): GenericOption<string> => ({
              ...previousValue,
              value,
            }),
          )
        : (previousValue as GenericOption<string>)
    } /* (previousValue.type === InputType.Variable) */ else {
      const result: Array<GenericVariable<string>> = normalizeVariableString(previousValue.value, {
        quotes: properties.settings.quotes,
        repeat,
        separator: properties.settings.separator,
      }).map(
        (value): GenericVariable<string> => ({
          ...previousValue,
          value,
        }),
      )

      return result
    }
  }).flat()
}

export function normalizeNumber(
  previousValues: DeNormalizedNumberValue[],
  properties: InputChoiceProperties | InputNumberProperties,
): NormalizedNumberValue[] {
  const { repeat } = properties.model.state

  return map(previousValues, (previousValue) => {
    if (previousValue.type === InputType.Option) {
      return repeat
        ? map(
            previousValue.value as number[],
            (value): GenericOption<number> => ({
              ...previousValue,
              value,
            }),
          )
        : (previousValue as GenericOption<number>)
    } /* (previousValue.type === InputType.Variable) */ else {
      const result: Array<GenericVariable<number>> = normalizeVariableNumber(previousValue.value, {
        quotes: properties.settings.quotes,
        repeat,
        separator: properties.settings.separator,
      }).map(
        (value): GenericVariable<number> => ({
          ...previousValue,
          value,
        }),
      )

      return result
    }
  }).flat()
}
