/* eslint-disable typescript/no-unsafe-assignment */
import { builder, Options } from '@escapace/fluent'
import { filter, find, some, map, assign, keys, reverse } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_BOOLEAN } from '../../types'
import { assert } from '../../utilities/assert'
import { reducer } from './reducer'
import {
  type InputBooleanActionDefault,
  type InputBooleanActionDescription,
  type InputBooleanActionOption,
  type InputBooleanActionReference,
  type InputBooleanActions,
  type InputBooleanActionVariable,
  type InputBooleanSettings,
  type InputBooleanState,
  InputBooleanTypeAction,
} from './types'

const fluentReducer = (log: InputBooleanActions): InputBooleanState => {
  const reference = (
    find(log, (action) => action.type === InputBooleanTypeAction.Reference) as
      | InputBooleanActionReference
      | undefined
  )?.payload

  const description = find(
    log,
    (action) => action.type === InputBooleanTypeAction.Description,
  )?.payload

  const _default = (
    find(log, (action) => action.type === InputBooleanTypeAction.Default) as
      | InputBooleanActionDefault
      | undefined
  )?.payload

  const isEmpty =
    log.length === 0 ||
    !some(
      log,
      (action) =>
        action.type === InputBooleanTypeAction.Option ||
        action.type === InputBooleanTypeAction.Variable,
    )

  const rlog = reverse([...log])

  const table = {
    options: assign(
      {},
      ...map(
        filter(
          rlog,
          ({ type }) => type === InputBooleanTypeAction.Option,
        ) as InputBooleanActionOption[],
        ({ payload }): { [key: string]: boolean } =>
          assign(
            {},
            payload.true === undefined ? undefined : { [payload.true]: true },
            payload.false === undefined ? undefined : { [payload.false]: false },
          ),
      ),
    ),
    variables: assign(
      {},
      ...map(
        filter(
          rlog,
          ({ type }) => type === InputBooleanTypeAction.Variable,
        ) as InputBooleanActionVariable[],
        ({ payload }): { [key: string]: boolean } =>
          assign(
            {},
            payload.true === undefined ? undefined : { [payload.true]: true },
            payload.false === undefined ? undefined : { [payload.false]: false },
          ),
      ),
    ),
  }

  return {
    default: _default,
    description,
    isEmpty,
    options: keys(table.options),
    reducer,
    reference,
    table,
    type: SYMBOL_INPUT_BOOLEAN,
    variables: keys(table.variables),
  }
}

export const boolean = builder<InputBooleanSettings>([
  {
    [Options.Interface]: (dispatch) => ({
      reference(reference: Reference) {
        assert.reference(reference)

        return dispatch<InputBooleanActionReference>({
          payload: reference,
          type: InputBooleanTypeAction.Reference,
        })
      },
    }),
    [Options.Keys]: ['reference'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputBooleanTypeAction.Reference,
  },
  {
    [Options.Dependencies]: [InputBooleanTypeAction.Reference],
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<InputBooleanActionDescription>({
          payload: description,
          type: InputBooleanTypeAction.Description,
        })
      },
    }),
    [Options.Keys]: ['description'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputBooleanTypeAction.Description,
  },
  {
    [Options.Conflicts]: [InputBooleanTypeAction.Default],
    [Options.Dependencies]: [InputBooleanTypeAction.Description],
    [Options.Interface]: (dispatch, _, state) => ({
      option(...value: [string | undefined, string | undefined]) {
        assert.inputDichotomousOption(value, state.options)

        return dispatch<InputBooleanActionOption>({
          payload: {
            false: value[1],
            true: value[0],
          },
          type: InputBooleanTypeAction.Option,
        })
      },
    }),
    [Options.Keys]: ['option'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputBooleanTypeAction.Option,
  },
  {
    [Options.Conflicts]: [InputBooleanTypeAction.Default],
    [Options.Dependencies]: [InputBooleanTypeAction.Description],
    [Options.Interface]: (dispatch, _, state) => ({
      variable(...value: [string | undefined, string | undefined]) {
        assert.inputBooleanVariable(value, state.variables)

        return dispatch<InputBooleanActionVariable>({
          payload: {
            false: value[1],
            true: value[0],
          },
          type: InputBooleanTypeAction.Variable,
        })
      },
    }),
    [Options.Keys]: ['variable'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputBooleanTypeAction.Variable,
  },
  {
    [Options.Dependencies]: [InputBooleanTypeAction.Description],
    [Options.Enabled]: (log) =>
      some(
        log,
        (action) =>
          action.type === InputBooleanTypeAction.Option ||
          action.type === InputBooleanTypeAction.Variable,
      ),
    [Options.Interface]: (dispatch) => ({
      default(value: boolean) {
        assert.boolean(value)

        return dispatch<InputBooleanActionDefault>({
          payload: value,
          type: InputBooleanTypeAction.Default,
        })
      },
    }),
    [Options.Keys]: ['default'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputBooleanTypeAction.Default,
  },
])
