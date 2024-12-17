/* eslint-disable typescript/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { flatMap } from 'lodash-es'
import type { InputGroup } from '../../input/group/types'
import { type Input, type PropertiesShared, SYMBOL_INPUT_GROUP } from '../../types'
import { usageInput } from '../inputs/input'
import type { HelpInputs } from '../types'

export const walkInputs = (
  properties: PropertiesShared,
  inputs: Input[],
  depth = 0,
): HelpInputs['inputs'] =>
  flatMap(inputs, (input) => {
    const type = input[SYMBOL_STATE].type

    return type === SYMBOL_INPUT_GROUP
      ? [
          {
            depth,
            description: input[SYMBOL_STATE].description!,
            type: SYMBOL_INPUT_GROUP,
          },
          ...walkInputs(properties, (input as InputGroup)[SYMBOL_STATE].inputs, depth + 1),
        ]
      : [usageInput(input as Exclude<Input, InputGroup>, depth, properties)]
  })
