import { map } from 'lodash-es'
import split from 'split-string'
import type { InputChoiceProperties } from '../input/choice/types'
import type { InputStringProperties } from '../input/string/types'
import {
  type DeNormalizedStringValue,
  type GenericOption,
  type GenericVariable,
  InputType,
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
      const asd: Array<GenericVariable<string>> = normalizeVariableString(previousValue.value, {
        quotes: properties.settings.quotes,
        repeat,
        separator: properties.settings.separator,
      }).map(
        (value): GenericVariable<string> => ({
          ...previousValue,
          value,
        }),
      )

      return asd
    }
  }).flat()
}
