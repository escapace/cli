/* eslint-disable typescript/no-unsafe-argument */
import { builder, Options, SYMBOL_STATE } from '@escapace/fluent'
import { filter, find, map, flatMap, reverse } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_GROUP, type Input } from '../../types'
import { assert } from '../../utilities/assert'
import { wrap, reducer as reducerDefault } from './reducer'
import { extract } from '../../utilities/extract'
import {
  type ActionDescription,
  type GenericInputGroupReducer,
  type ActionReducer,
  type ActionInput,
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

  const inputs = map(
    filter(rlog, ({ type }) => type === TypeAction.Input) as ActionInput[],
    (value) => value.payload,
  )

  const isEmpty = inputs.length === 0

  const options = flatMap(inputs, (value) => value[SYMBOL_STATE].options)
  const variables = flatMap(inputs, (value) => value[SYMBOL_STATE].variables)

  const reducerMaybe = (
    find(log, (action) => action.type === TypeAction.Reducer) as ActionReducer | undefined
  )?.payload

  const reducer: GenericInputGroupReducer =
    reducerMaybe === undefined
      ? reducerDefault
      : async (values, properties) => reducerMaybe(await wrap(values, properties), properties)

  return {
    description,
    inputs,
    isEmpty,
    options,
    reducer,
    reference,
    type: SYMBOL_INPUT_GROUP,
    variables,
  }
}

export const group = builder<Settings>([
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
    [Options.Conflicts]: [TypeAction.Reducer],
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Interface]: (dispatch, log, state) => ({
      input(value: Input) {
        assert.input(value, { log, state })

        const payload = extract(value)

        return dispatch<ActionInput>({
          payload,
          type: TypeAction.Input,
        })
      },
    }),
    [Options.Keys]: ['input'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Input,
  },
  {
    [Options.Enabled]: (_, state) => !state.isEmpty,
    [Options.Interface]: (dispatch) => ({
      reducer(value: GenericInputGroupReducer) {
        assert.function(value)

        return dispatch<ActionReducer>({
          payload: value,
          type: TypeAction.Reducer,
        })
      },
    }),
    [Options.Keys]: ['reducer'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Reducer,
  },
])
