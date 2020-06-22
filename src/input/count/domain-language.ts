import { builder, Options } from '@escapace/fluent'
import { filter, find, some, assign, map, keys } from 'lodash-es'
import { Reference, SYMBOL_INPUT_COUNT } from '../../types'
import { assert } from '../../utilities/assert'
import { fallback } from '../../utilities/fallback'
import { reducer } from './reducer'
import {
  ActionDefault,
  ActionDescription,
  ActionOption,
  ActionReference,
  Actions,
  Settings,
  State,
  TypeAction
} from './types'

export const fluentReducer = (log: Actions[]): State => {
  const reference = (find(
    log,
    (action) => action.type === TypeAction.Reference
  ) as ActionReference | undefined)?.payload

  const description = (find(
    log,
    (action) => action.type === TypeAction.Description
  ) as ActionDescription | undefined)?.payload

  const _default = fallback(
    0,
    (find(log, (action) => action.type === TypeAction.Default) as
      | ActionDefault
      | undefined)?.payload
  )

  const isEmpty =
    log.length === 0 ||
    !some(log, (action) => action.type === TypeAction.Option)

  const table = assign(
    {},
    ...map(
      filter(log, ({ type }) => type === TypeAction.Option) as ActionOption[],
      ({ payload }): { [key: string]: number } =>
        assign(
          {},
          payload.increase === undefined
            ? undefined
            : { [payload.increase]: 1 },
          payload.decrease === undefined
            ? undefined
            : { [payload.decrease]: -1 }
        )
    )
  )

  return {
    type: SYMBOL_INPUT_COUNT,
    default: _default,
    description,
    isEmpty,
    options: keys(table),
    reducer,
    reference,
    table,
    variables: []
  }
}

export const count = builder<Settings>([
  {
    [Options.Type]: TypeAction.Reference,
    [Options.Keys]: ['reference'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch) => ({
      reference(reference: Reference) {
        assert.reference(reference)

        return dispatch<ActionReference>({
          type: TypeAction.Reference,
          payload: reference
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Description,
    [Options.Dependencies]: [TypeAction.Reference],
    [Options.Keys]: ['description'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<ActionDescription>({
          type: TypeAction.Description,
          payload: description
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Default,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Keys]: ['default'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch) => ({
      default(value: number) {
        assert.number(value)

        return dispatch<ActionDefault>({
          type: TypeAction.Default,
          payload: value
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Option,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Keys]: ['option'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch, _, { options }) => ({
      option(...value: [string | undefined, string | undefined]) {
        assert.inputDichotomousOption(value, options)

        return dispatch<ActionOption>({
          type: TypeAction.Option,
          payload: {
            increase: value[0],
            decrease: value[1]
          }
        })
      }
    })
  }
])
