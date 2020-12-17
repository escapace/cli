import { builder, Options, SYMBOL_STATE } from '@escapace/fluent'
import { filter, find, map, flatMap } from 'lodash-es'
import { Reference, SYMBOL_INPUT_GROUP, Input } from '../../types'
import { assert } from '../../utility/assert'
import { fallback } from '../../utility/fallback'
import { normalize } from './normalize'
import { reducer } from './reducer'
import { extract } from '../../utility/extract'
import {
  ActionDescription,
  ActionReducer,
  ActionInput,
  ActionReference,
  Actions,
  GenericInputGroupReducer,
  Settings,
  State,
  TypeAction
} from './types'

export const fluentReducer = (log: Actions): State => {
  const reference = (find(
    log,
    (action) => action.type === TypeAction.Reference
  ) as ActionReference | undefined)?.payload

  const description = (find(
    log,
    (action) => action.type === TypeAction.Description
  ) as ActionDescription | undefined)?.payload

  const inputs = map(
    filter(log, ({ type }) => type === TypeAction.Input) as ActionInput[],
    (value) => value.payload
  )

  const isEmpty = inputs.length === 0

  const options = flatMap(inputs, (value) => value[SYMBOL_STATE].options)
  const variables = flatMap(inputs, (value) => value[SYMBOL_STATE].variables)

  const _reducer: GenericInputGroupReducer = fallback(
    reducer,
    (find(log, (action) => action.type === TypeAction.Reducer) as
      | ActionReducer
      | undefined)?.payload
  )

  return {
    type: SYMBOL_INPUT_GROUP,
    description,
    inputs,
    isEmpty,
    options,
    reducer: _reducer,
    reference,
    variables
  }
}

export const group = builder<Settings>([
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
    [Options.Type]: TypeAction.Input,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Keys]: ['input'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Conflicts]: [TypeAction.Reducer],
    [Options.Interface]: (dispatch, log, state) => ({
      input(value: Input) {
        assert.input(value, { log, state })

        const payload = extract(value)

        return dispatch<ActionInput>({
          type: TypeAction.Input,
          payload
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Reducer,
    [Options.Keys]: ['reducer'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Enabled]: (_, state) => !state.isEmpty,
    [Options.Interface]: (dispatch) => ({
      reducer(value: Function) {
        assert.function(value)

        return dispatch<ActionReducer>({
          type: TypeAction.Reducer,
          payload: async (values, model) =>
            value(await normalize(values, model), model)
        })
      }
    })
  }
])
