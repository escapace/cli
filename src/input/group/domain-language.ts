/* eslint-disable typescript/no-unsafe-argument */
import { builder, Options, SYMBOL_STATE } from '@escapace/fluent'
import { filter, find, map, flatMap, reverse } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_GROUP, type Input } from '../../types'
import { assert } from '../../utilities/assert'
import { wrap, reducer as reducerDefault } from './reducer'
import { extract } from '../../utilities/extract'
import {
  type InputGroupActionDescription,
  type InputGroupReducerGeneric,
  type InputGroupActionReducer,
  type InputGroupActionInput,
  type InputGroupActionReference,
  type InputGroupActions,
  type InputGroupSettings,
  type InputGroupState,
  InputGroupTypeAction,
} from './types'

const fluentReducer = (log: InputGroupActions): InputGroupState => {
  const reference = (
    find(log, (action) => action.type === InputGroupTypeAction.Reference) as
      | InputGroupActionReference
      | undefined
  )?.payload

  const description = find(
    log,
    (action) => action.type === InputGroupTypeAction.Description,
  )?.payload

  const rlog = reverse([...log])

  const inputs = map(
    filter(rlog, ({ type }) => type === InputGroupTypeAction.Input) as InputGroupActionInput[],
    (value) => value.payload,
  )

  const isEmpty = inputs.length === 0

  const options = flatMap(inputs, (value) => value[SYMBOL_STATE].options)
  const variables = flatMap(inputs, (value) => value[SYMBOL_STATE].variables)

  const reducerMaybe = (
    find(log, (action) => action.type === InputGroupTypeAction.Reducer) as
      | InputGroupActionReducer
      | undefined
  )?.payload

  const reducer: InputGroupReducerGeneric =
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

export const group = builder<InputGroupSettings>([
  {
    [Options.Interface]: (dispatch) => ({
      reference(reference: Reference) {
        assert.reference(reference)

        return dispatch<InputGroupActionReference>({
          payload: reference,
          type: InputGroupTypeAction.Reference,
        })
      },
    }),
    [Options.Keys]: ['reference'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputGroupTypeAction.Reference,
  },
  {
    [Options.Dependencies]: [InputGroupTypeAction.Reference],
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<InputGroupActionDescription>({
          payload: description,
          type: InputGroupTypeAction.Description,
        })
      },
    }),
    [Options.Keys]: ['description'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputGroupTypeAction.Description,
  },
  {
    [Options.Conflicts]: [InputGroupTypeAction.Reducer],
    [Options.Dependencies]: [InputGroupTypeAction.Description],
    [Options.Interface]: (dispatch, log, state) => ({
      input(value: Input) {
        assert.input(value, { log, state })

        const payload = extract(value)

        return dispatch<InputGroupActionInput>({
          payload,
          type: InputGroupTypeAction.Input,
        })
      },
    }),
    [Options.Keys]: ['input'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputGroupTypeAction.Input,
  },
  {
    [Options.Enabled]: (_, state) => !state.isEmpty,
    [Options.Interface]: (dispatch) => ({
      reducer(value: InputGroupReducerGeneric) {
        assert.function(value)

        return dispatch<InputGroupActionReducer>({
          payload: value,
          type: InputGroupTypeAction.Reducer,
        })
      },
    }),
    [Options.Keys]: ['reducer'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputGroupTypeAction.Reducer,
  },
])
