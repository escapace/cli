import { SYMBOL_STATE } from '@escapace/fluent'
import type { InputBoolean } from '../../input/boolean/types'
import type { InputChoice } from '../../input/choice/types'
import type { InputCount } from '../../input/count/types'
import type { InputGroup } from '../../input/group/types'
import type { InputNumber } from '../../input/number/types'
import type { InputString } from '../../input/string/types'
import {
  type Input,
  type PropertiesShared,
  SYMBOL_INPUT_BOOLEAN,
  SYMBOL_INPUT_CHOICE,
  SYMBOL_INPUT_COUNT,
  SYMBOL_INPUT_NUMBER,
  SYMBOL_INPUT_STRING,
} from '../../types'
import type { HelpInputsExcluding } from '../types'
import { usageInputBoolean } from './input-boolean'
import { usageInputChoice } from './input-choice'
import { usageInputCount } from './input-count'
import { usageInputNumber } from './input-number'
import { usageInputString } from './input-string'

export const usageInput = (
  input: Exclude<Input, InputGroup>,
  depth: number,
  properties: PropertiesShared,
): HelpInputsExcluding => {
  switch (input[SYMBOL_STATE].type) {
    case SYMBOL_INPUT_BOOLEAN:
      return usageInputBoolean(input as InputBoolean, depth)
    case SYMBOL_INPUT_CHOICE:
      return usageInputChoice(input as InputChoice, depth, properties)
    case SYMBOL_INPUT_COUNT:
      return usageInputCount(input as InputCount, depth)
    case SYMBOL_INPUT_NUMBER:
      return usageInputNumber(input as InputNumber, depth, properties)
    case SYMBOL_INPUT_STRING:
      return usageInputString(input as InputString, depth, properties)
  }
}
