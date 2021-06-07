import { flatMap, map } from 'lodash-es'
import {
  DeNormalizedNumberValue,
  DeNormalizedStringValue,
  InputType,
  NormalizedNumberValue,
  NormalizedStringValue,
  NormalizeNumberOptions,
  NormalizeStringOptions
} from '../types'

export function normalize(
  options: NormalizeNumberOptions
): NormalizedNumberValue[]
export function normalize(
  options: NormalizeStringOptions
): NormalizedStringValue[]
export function normalize(
  options: NormalizeStringOptions | NormalizeNumberOptions
): NormalizedStringValue[] | NormalizedNumberValue[] {
  return flatMap<any, any>(
    options.values,
    (initial: DeNormalizedStringValue | DeNormalizedNumberValue) => {
      if (options.repeat) {
        const values: string[] =
          initial.type === InputType.Variable
            ? options.variables[initial.name].split(initial.value)
            : (initial.value as string[])

        return map(
          values,
          (value): NormalizedStringValue => ({
            ...initial,
            value
          })
        )
      } else {
        return initial as NormalizedStringValue
      }
    }
  )
}
