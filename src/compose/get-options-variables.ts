import { compact, intersection, keys } from 'lodash-es'
import type { InputBooleanStateInitial } from '../input/boolean/types'
import type { InputChoiceStateInitial } from '../input/choice/types'
import type { InputCountState } from '../input/count/types'
import type { InputGroupState } from '../input/group/types'
import type { InputStringStateInitial } from '../input/string/types'
import { type GenericOption, type GenericVariable, InputType, type Match } from '../types'

export const getOptionsVariables = (
  state:
    | InputBooleanStateInitial
    | InputChoiceStateInitial
    | InputCountState
    | InputGroupState
    | InputStringStateInitial,
  match: Match,
) => {
  const options: Array<GenericOption<boolean | number | string | number[] | string[]>> =
    intersection(state.options, keys(match.options)).map((name) => ({
      name,
      type: InputType.Option,
      value: match.options[name],
    }))

  const variables: Array<GenericVariable<string>> = compact(
    intersection(state.variables, keys(match.variables)).map((name) => {
      const value = match.variables[name]
      return value === undefined
        ? undefined
        : {
            name,
            type: InputType.Variable,
            value,
          }
    }),
  )

  return [...options, ...variables]
}
