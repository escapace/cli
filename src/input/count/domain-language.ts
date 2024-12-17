/* eslint-disable typescript/no-unsafe-assignment */
import { builder, Options } from '@escapace/fluent'
import { filter, find, some, assign, map, keys, reverse } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_COUNT } from '../../types'
import { assert } from '../../utilities/assert'
import { fallback } from '../../utilities/fallback'
import { reducer } from './reducer'
import {
  type ActionDefault,
  type ActionDescription,
  type ActionOption,
  type ActionReference,
  type Actions,
  type Settings,
  type State,
  TypeAction,
} from './types'

const fluentReducer = (log: Actions): State => {
  const reference = (
    find(log, (action) => action.type === TypeAction.Reference) as ActionReference | undefined
  )?.payload

  const description = find(log, (action) => action.type === TypeAction.Description)?.payload

  const rlog = reverse([...log])

  const _default = fallback(
    0,
    (find(log, (action) => action.type === TypeAction.Default) as ActionDefault | undefined)
      ?.payload,
  )

  const isEmpty = log.length === 0 || !some(log, (action) => action.type === TypeAction.Option)

  const options = filter(rlog, ({ type }) => type === TypeAction.Option) as ActionOption[]

  const table = assign(
    {},
    ...map(options, ({ payload }): { [key: string]: number } =>
      assign(
        {},
        payload.increase === undefined ? undefined : { [payload.increase]: 1 },
        payload.decrease === undefined ? undefined : { [payload.decrease]: -1 },
      ),
    ),
  )

  return {
    default: _default,
    description,
    isEmpty,
    options: keys(table),
    reducer,
    reference,
    table,
    type: SYMBOL_INPUT_COUNT,
    variables: [],
  }
}

export const count = builder<Settings>([
  {
    [Options.Interface]: (dispatch) => ({
      reference(reference: Reference) {
        assert.reference(reference)

        return dispatch<ActionReference>({
          payload: reference,
          type: TypeAction.Reference,
        })
      },
    }),
    [Options.Keys]: ['reference'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Reference,
  },
  {
    [Options.Dependencies]: [TypeAction.Reference],
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<ActionDescription>({
          payload: description,
          type: TypeAction.Description,
        })
      },
    }),
    [Options.Keys]: ['description'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Description,
  },
  {
    [Options.Conflicts]: [TypeAction.Default],
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Interface]: (dispatch, _, { options }) => ({
      option(...value: [string | undefined, string | undefined]) {
        assert.inputDichotomousOption(value, options)

        return dispatch<ActionOption>({
          payload: {
            decrease: value[1],
            increase: value[0],
          },
          type: TypeAction.Option,
        })
      },
    }),
    [Options.Keys]: ['option'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Option,
  },
  {
    [Options.Dependencies]: [TypeAction.Option],
    [Options.Interface]: (dispatch) => ({
      default(value: number) {
        assert.number(value)

        return dispatch<ActionDefault>({
          payload: value,
          type: TypeAction.Default,
        })
      },
    }),
    [Options.Keys]: ['default'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Default,
  },
])
