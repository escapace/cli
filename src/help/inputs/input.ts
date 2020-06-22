/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { InputBoolean } from '../../input/boolean/types'
import { InputChoice } from '../../input/choice/types'
import { InputCount } from '../../input/count/types'
import { InputGroup } from '../../input/group/types'
import { InputString } from '../../input/string/types'
import {
  Input,
  PropsShared,
  SYMBOL_INPUT_BOOLEAN,
  SYMBOL_INPUT_CHOICE,
  SYMBOL_INPUT_COUNT,
  SYMBOL_INPUT_STRING
} from '../../types'
import { HelpInputsExcluding } from '../types'
import { usageInputBoolean } from './input-boolean'
import { usageInputChoice } from './input-choice'
import { usageInputCount } from './input-count'
import { usageInputString } from './input-string'

export const usageInput = (
  input: Exclude<Input, InputGroup>,
  depth: number,
  props: PropsShared
): HelpInputsExcluding => {
  switch (input[SYMBOL_STATE].type) {
    case SYMBOL_INPUT_BOOLEAN:
      return usageInputBoolean(input as InputBoolean, depth)
    case SYMBOL_INPUT_STRING:
      return usageInputString(input as InputString, depth, props)
    case SYMBOL_INPUT_CHOICE:
      return usageInputChoice(input as InputChoice, depth, props)
    case SYMBOL_INPUT_COUNT:
      return usageInputCount(input as InputCount, depth)
  }
}
