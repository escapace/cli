/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import { compact, forEach, join } from 'lodash-es'
import { InputBoolean } from '../../input/boolean/types'
import { SYMBOL_INPUT_BOOLEAN } from '../../types'
import { HELP_SIGN_OR } from '../constants'
import { enclose } from '../enclose'
import { HelpInputsExcluding } from '../types'

export const usageInputBoolean = (
  input: InputBoolean,
  depth: number
): HelpInputsExcluding<typeof SYMBOL_INPUT_BOOLEAN> => {
  const { description, options, table, type, variables } = input[SYMBOL_STATE]

  const yes: string[] = []
  const no: string[] = []

  forEach(table.options, (value, key) => (value ? yes.push(key) : no.push(key)))

  return {
    variables:
      variables.length === 0 ? undefined : `${enclose(variables)}=<boolean>`,
    options:
      options.length === 0
        ? undefined
        : join(
            compact([
              yes.length === 0 ? undefined : `[${join(yes, HELP_SIGN_OR)}]`,
              no.length === 0 ? undefined : `[${join(no, HELP_SIGN_OR)}]`
            ]),
            ' '
          ),
    type: type as typeof SYMBOL_INPUT_BOOLEAN,
    description: description!,
    depth
  }
}
