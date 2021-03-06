/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-floating-promises */
import { compact, get, intersection, keys } from 'lodash-es'
import { InputBooleanState } from '../input/boolean/types'
import { InputChoiceState } from '../input/choice/types'
import { InputCountState } from '../input/count/types'
import { InputGroupState } from '../input/group/types'
import { InputStringState } from '../input/string/types'
import { GenericOption, GenericVariable, InputType, Match } from '../types'

export const getOptionsVariables = (
  state:
    | InputBooleanState
    | InputChoiceState
    | InputCountState
    | InputStringState
    | InputGroupState,
  match: Match
) => {
  const options: Array<
    GenericOption<boolean | string | string[] | number | number[]>
  > = intersection(state.options, keys(match.options)).map((name) => ({
    type: InputType.Option,
    name,
    value: match.options[name]
  }))

  const variables: Array<GenericVariable<string>> = compact(
    intersection(state.variables, keys(match.variables)).map((name) => {
      const value = match.variables[name]
      return value === undefined
        ? undefined
        : {
            type: InputType.Variable,
            name,
            value
          }
    })
  )

  const configuration = get(match.configuration, [state.reference!])

  return [
    ...options,
    ...variables,
    ...(configuration === undefined
      ? []
      : [
          {
            type: InputType.Configuration,
            name: [state.reference],
            value: configuration
          }
        ])
  ]
}
