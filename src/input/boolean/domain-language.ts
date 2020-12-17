import { builder, Options } from '@escapace/fluent'
import { filter, find, some, map, assign, keys } from 'lodash-es'
import { Reference, SYMBOL_INPUT_BOOLEAN } from '../../types'
import { assert } from '../../utility/assert'
import { reducer } from './reducer'
import {
  ActionDefault,
  ActionDescription,
  ActionOption,
  ActionReference,
  Actions,
  ActionVariable,
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

  const _default = (find(
    log,
    (action) => action.type === TypeAction.Default
  ) as ActionDefault | undefined)?.payload

  const isEmpty =
    log.length === 0 ||
    !some(
      log,
      (action) =>
        action.type === TypeAction.Option || action.type === TypeAction.Variable
    )

  const table = {
    options: assign(
      {},
      ...map(
        filter(log, ({ type }) => type === TypeAction.Option) as ActionOption[],
        ({ payload }): { [key: string]: boolean } =>
          assign(
            {},
            payload.true === undefined ? undefined : { [payload.true]: true },
            payload.false === undefined ? undefined : { [payload.false]: false }
          )
      )
    ),
    variables: assign(
      {},
      ...map(
        filter(
          log,
          ({ type }) => type === TypeAction.Variable
        ) as ActionVariable[],
        ({ payload }): { [key: string]: boolean } =>
          assign(
            {},
            payload.true === undefined ? undefined : { [payload.true]: true },
            payload.false === undefined ? undefined : { [payload.false]: false }
          )
      )
    )
  }

  return {
    type: SYMBOL_INPUT_BOOLEAN,
    default: _default,
    description,
    isEmpty,
    options: keys(table.options),
    reducer,
    reference,
    table,
    variables: keys(table.variables)
  }
}

export const boolean = builder<Settings>([
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
    [Options.Type]: TypeAction.Option,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Keys]: ['option'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Conflicts]: [TypeAction.Default],
    [Options.Interface]: (dispatch, _, state) => ({
      option(...value: [string | undefined, string | undefined]) {
        assert.inputDichotomousOption(value, state.options)

        return dispatch<ActionOption>({
          type: TypeAction.Option,
          payload: {
            true: value[0],
            false: value[1]
          }
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Variable,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Keys]: ['variable'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Conflicts]: [TypeAction.Default],
    [Options.Interface]: (dispatch, _, state) => ({
      variable(...value: [string | undefined, string | undefined]) {
        assert.inputBooleanVariable(value, state.variables)

        return dispatch<ActionVariable>({
          type: TypeAction.Variable,
          payload: {
            true: value[0],
            false: value[1]
          }
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Default,
    [Options.Keys]: ['default'],
    [Options.Once]: true,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch) => ({
      default(value: boolean) {
        assert.boolean(value)

        return dispatch<ActionDefault>({
          type: TypeAction.Default,
          payload: value
        })
      }
    })
  }
])
