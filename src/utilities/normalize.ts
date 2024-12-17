import { flatMap, map, split } from 'lodash-es'
import type { PropertiesInputChoice } from '../input/choice/types'
import type { PropertiesInputString } from '../input/string/types'
import {
  type DeNormalizedStringValue,
  type GenericConfiguration,
  type GenericOption,
  type GenericVariable,
  InputType,
  type NormalizedStringValue,
} from '../types'
import { assert } from './assert'

export function normalizeString(
  previousValues: DeNormalizedStringValue[],
  properties: PropertiesInputChoice | PropertiesInputString,
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
    } else if (previousValue.type === InputType.Variable) {
      return repeat
        ? map(
            split(previousValue.value, properties.settings.split),
            (value): GenericVariable<string> => ({
              ...previousValue,
              value,
            }),
          )
        : previousValue
    } else {
      if (repeat) {
        // TODO: error handling assert or message?
        assert.strings(previousValue.value)

        return map(
          previousValue.value,
          (value): GenericConfiguration<string> => ({
            ...previousValue,
            value,
          }),
        )
      } else {
        // TODO: error handling assert or message?
        assert.string(previousValue.value)

        return previousValue as GenericConfiguration<string>
      }
    }
  })
}
