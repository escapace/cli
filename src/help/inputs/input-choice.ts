/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { join, map } from 'lodash-es'
import { InputChoice } from '../../input/choice/types'
import { PropsShared, SYMBOL_INPUT_CHOICE } from '../../types'
import { HELP_SIGN_OR, HELP_SIGN_REPEAT } from '../constants'
import { enclose } from '../enclose'
import { HelpInputsExcluding } from '../types'

export const usageInputChoice = (
  input: InputChoice,
  depth: number,
  props: PropsShared
): HelpInputsExcluding<typeof SYMBOL_INPUT_CHOICE> => {
  const { description, options, type, variables, choices } = input[SYMBOL_STATE]
  const repeat = input[SYMBOL_STATE].repeat && choices.length > 1

  return {
    variables:
      variables.length === 0
        ? undefined
        : `${enclose(variables)}=${
            choices.length === 1
              ? choices[0]
              : `(${join(
                  map(choices, (choice) => `${props.settings.split}${choice}`),
                  HELP_SIGN_OR
                )})`
          }${repeat ? `${HELP_SIGN_REPEAT}` : ''}`,
    options:
      options.length === 0
        ? undefined
        : `[${enclose(options)}=${enclose(choices)}]${
            repeat ? `${HELP_SIGN_REPEAT}` : ''
          }`,
    type: type as typeof SYMBOL_INPUT_CHOICE,
    description: description!,
    depth
  }
}
