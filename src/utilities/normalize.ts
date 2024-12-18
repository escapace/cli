import { flatMap, map, split } from 'lodash-es'
import type { InputChoiceProperties } from '../input/choice/types'
import type { InputStringProperties } from '../input/string/types'
import {
  type DeNormalizedStringValue,
  type GenericOption,
  type GenericVariable,
  InputType,
  type NormalizedStringValue,
} from '../types'

export function normalizeString(
  previousValues: DeNormalizedStringValue[],
  properties: InputChoiceProperties | InputStringProperties,
): NormalizedStringValue[] {
  const { repeat } = properties.model.state

  return flatMap(previousValues, (previousValue) => {
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
      return repeat
        ? map(
            split(previousValue.value, properties.settings.split),
            (value): GenericVariable<string> => ({
              ...previousValue,
              value,
            }),
          )
        : previousValue
    }
  })
}
