/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { compact, forEach, join } from 'lodash-es'
import { InputCount } from '../../input/count/types'
import { SYMBOL_INPUT_COUNT } from '../../types'
import { HELP_SIGN_OR, HELP_SIGN_REPEAT } from '../constants'
import { HelpInputsExcluding } from '../types'

export const usageInputCount = (
  input: InputCount,
  depth: number
): HelpInputsExcluding<typeof SYMBOL_INPUT_COUNT> => {
  const { description, options, type, table } = input[SYMBOL_STATE]

  const plus: string[] = []
  const minus: string[] = []

  forEach(table, (value, key) => (value > 0 ? plus.push(key) : minus.push(key)))

  return {
    variables: undefined,
    options:
      options.length === 0
        ? undefined
        : join(
            compact([
              plus.length === 0
                ? undefined
                : `[${join(plus, HELP_SIGN_OR)}]${HELP_SIGN_REPEAT}`,
              minus.length === 0
                ? undefined
                : `[${join(minus, HELP_SIGN_OR)}]${HELP_SIGN_REPEAT}`
            ]),
            ' '
          ),
    type: type as typeof SYMBOL_INPUT_COUNT,
    description: description!,
    depth
  }
}
