/* eslint-disable typescript/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import type { InputString } from '../../input/string/types'
import type { PropertiesShared, SYMBOL_INPUT_STRING } from '../../types'
import { HELP_SIGN_REPEAT } from '../constants'
import { enclose } from '../enclose'
import type { HelpInputsExcluding } from '../types'

export const usageInputString = (
  input: InputString,
  depth: number,
  properties: PropertiesShared,
): HelpInputsExcluding<typeof SYMBOL_INPUT_STRING> => {
  const { description, options, repeat, type, variables } = input[SYMBOL_STATE]

  return {
    depth,
    description: description!,
    options:
      options.length === 0
        ? undefined
        : `[${enclose(options)}=<string>]${repeat ? `${HELP_SIGN_REPEAT}` : ''}`,
    type: type as typeof SYMBOL_INPUT_STRING,
    variables:
      variables.length === 0
        ? undefined
        : `${enclose(variables)}=${
            repeat
              ? `<string>[${properties.settings.separator}<string>]${HELP_SIGN_REPEAT}`
              : '<string>'
          }`,
  }
}
