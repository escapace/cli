/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { InputString } from '../../input/string/types'
import { PropsShared, SYMBOL_INPUT_STRING } from '../../types'
import { HELP_SIGN_REPEAT } from '../constants'
import { enclose } from '../enclose'
import { HelpInputsExcluding } from '../types'

export const usageInputString = (
  input: InputString,
  depth: number,
  props: PropsShared
): HelpInputsExcluding<typeof SYMBOL_INPUT_STRING> => {
  const { description, options, type, variables, repeat } = input[SYMBOL_STATE]

  return {
    variables:
      variables.length === 0
        ? undefined
        : `${enclose(variables)}=${
            repeat
              ? `<string>[${props.settings.split}<string>]${HELP_SIGN_REPEAT}`
              : '<string>'
          }`,
    options:
      options.length === 0
        ? undefined
        : `[${enclose(options)}=<string>]${
            repeat ? `${HELP_SIGN_REPEAT}` : ''
          }`,
    type: type as typeof SYMBOL_INPUT_STRING,
    description: description!,
    depth
  }
}
