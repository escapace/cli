/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { flatMap } from 'lodash-es'
import { InputGroup } from '../../input/group/types'
import { Input, PropsShared, SYMBOL_INPUT_GROUP } from '../../types'
import { usageInput } from '../inputs/input'
import { HelpInputs } from '../types'

export const walkInputs = (
  props: PropsShared,
  inputs: Input[],
  depth = 0
): HelpInputs['inputs'] =>
  flatMap(inputs, (input) => {
    const type = input[SYMBOL_STATE].type

    if (type === SYMBOL_INPUT_GROUP) {
      return [
        {
          type: SYMBOL_INPUT_GROUP,
          description: input[SYMBOL_STATE].description!,
          depth
        },
        ...walkInputs(
          props,
          (input as InputGroup)[SYMBOL_STATE].inputs,
          depth + 1
        )
      ]
    } else {
      return [usageInput(input as Exclude<Input, InputGroup>, depth, props)]
    }
  })
