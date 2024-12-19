/* eslint-disable typescript/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import type { InputNumber } from '../../input/number/types'
import type { PropertiesShared, SYMBOL_INPUT_NUMBER } from '../../types'
import { HELP_SIGN_REPEAT } from '../constants'
import { enclose } from '../enclose'
import type { HelpInputsExcluding } from '../types'

export const usageInputNumber = (
  input: InputNumber,
  depth: number,
  properties: PropertiesShared,
): HelpInputsExcluding<typeof SYMBOL_INPUT_NUMBER> => {
  const { description, options, repeat, type, variables } = input[SYMBOL_STATE]

  return {
    depth,
    description: description!,
    options:
      options.length === 0
        ? undefined
        : `[${enclose(options)}=<number>]${repeat ? `${HELP_SIGN_REPEAT}` : ''}`,
    type: type as typeof SYMBOL_INPUT_NUMBER,
    variables:
      variables.length === 0
        ? undefined
        : `${enclose(variables)}=${
            repeat
              ? `<number>[${properties.settings.separator}<number>]${HELP_SIGN_REPEAT}`
              : '<number>'
          }`,
  }
}
