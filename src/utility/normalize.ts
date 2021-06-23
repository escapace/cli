import { flatMap, map, split } from 'lodash-es'
import {
  DeNormalizedNumberValue,
  DeNormalizedStringValue,
  InputType,
  NormalizedNumberValue,
  NormalizedStringValue,
  NormalizeNumberOptions,
  NormalizeStringOptions,
  PropsInputShared
} from '../types'

export function normalize(
  options: NormalizeNumberOptions,
  props: PropsInputShared
): NormalizedNumberValue[]
export function normalize(
  options: NormalizeStringOptions,
  props: PropsInputShared
): NormalizedStringValue[]
export function normalize(
  options: NormalizeStringOptions | NormalizeNumberOptions,
  props: PropsInputShared
): NormalizedStringValue[] | NormalizedNumberValue[] {
  return flatMap<any, any>(
    options.values,
    (initial: DeNormalizedStringValue | DeNormalizedNumberValue) => {
      if (options.repeat) {
        const values: string[] =
          initial.type === InputType.Variable
            ? split(initial.value, props.settings.split)
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
