/* eslint-disable typescript/no-unsafe-assignment */
import { builder, Options } from '@escapace/fluent'
import { filter, find, some, map, assign, keys, reverse } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_BOOLEAN } from '../../types'
import { assert } from '../../utility/assert'
import { reducer } from './reducer'
import {
  type ActionDefault,
  type ActionDescription,
  type ActionOption,
  type ActionReference,
  type Actions,
  type ActionVariable,
  type Settings,
  type State,
  TypeAction,
} from './types'

const fluentReducer = (log: Actions): State => {
  const reference = (
    find(log, (action) => action.type === TypeAction.Reference) as ActionReference | undefined
  )?.payload

  const description = find(log, (action) => action.type === TypeAction.Description)?.payload

  const _default = (
    find(log, (action) => action.type === TypeAction.Default) as ActionDefault | undefined
  )?.payload

  const isEmpty =
    log.length === 0 ||
    !some(log, (action) => action.type === TypeAction.Option || action.type === TypeAction.Variable)

  const rlog = reverse([...log])

  const table = {
    options: assign(
      {},
      ...map(
        filter(rlog, ({ type }) => type === TypeAction.Option) as ActionOption[],
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
        filter(rlog, ({ type }) => type === TypeAction.Variable) as ActionVariable[],
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

export const boolean = builder<Settings>([
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
    [Options.Interface]: (dispatch, _, state) => ({
      option(...value: [string | undefined, string | undefined]) {
        assert.inputDichotomousOption(value, state.options)

        return dispatch<ActionOption>({
          payload: {
            false: value[1],
            true: value[0],
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
    [Options.Conflicts]: [TypeAction.Default],
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Interface]: (dispatch, _, state) => ({
      variable(...value: [string | undefined, string | undefined]) {
        assert.inputBooleanVariable(value, state.variables)

        return dispatch<ActionVariable>({
          payload: {
            false: value[1],
            true: value[0],
          },
          type: TypeAction.Variable,
        })
      },
    }),
    [Options.Keys]: ['variable'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Variable,
  },
  {
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Enabled]: (log) =>
      some(
        log,
        (action) => action.type === TypeAction.Option || action.type === TypeAction.Variable,
      ),
    [Options.Interface]: (dispatch) => ({
      default(value: boolean) {
        assert.boolean(value)

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
