/* eslint-disable typescript/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { join, map } from 'lodash-es'
import type { InputChoice } from '../../input/choice/types'
import type { PropertiesShared, SYMBOL_INPUT_CHOICE } from '../../types'
import { HELP_SIGN_OR, HELP_SIGN_REPEAT } from '../constants'
import { enclose } from '../enclose'
import type { HelpInputsExcluding } from '../types'

export const usageInputChoice = (
  input: InputChoice,
  depth: number,
  properties: PropertiesShared,
): HelpInputsExcluding<typeof SYMBOL_INPUT_CHOICE> => {
  const { choices, description, options, type, variables } = input[SYMBOL_STATE]
  const repeat = input[SYMBOL_STATE].repeat && choices.length > 1

  return {
    depth,
    description: description!,
    options:
      options.length === 0
        ? undefined
        : `[${enclose(options)}=${enclose(choices)}]${repeat ? `${HELP_SIGN_REPEAT}` : ''}`,
    type: type as typeof SYMBOL_INPUT_CHOICE,
    variables:
      variables.length === 0
        ? undefined
        : `${enclose(variables)}=${
            choices.length === 1
              ? choices[0]
              : `(${join(
                  map(choices, (choice) => `${properties.settings.split}${choice}`),
                  HELP_SIGN_OR,
                )})`
          }${repeat ? `${HELP_SIGN_REPEAT}` : ''}`,
  }
}
