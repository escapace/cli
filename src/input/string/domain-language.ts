import { builder, Options } from '@escapace/fluent'
import { defaults, filter, find, map, some } from 'lodash-es'
import { settingsVariable } from '../../constants'
import { Reference, SettingsVariable, SYMBOL_INPUT_STRING } from '../../types'
import { assert } from '../../utility/assert'
import { normalize } from './normalize'
import { reducer as reducerDefault } from './reducer'
import {
  ActionDefault,
  ActionDescription,
  ActionOption,
  ActionReducer,
  ActionReference,
  ActionRepeat,
  Actions,
  ActionVariable,
  GenericInputStringReducer,
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

  const repeat = Boolean(find(log, ({ type }) => type === TypeAction.Repeat))

  const reducerMaybe = (find(
    log,
    (action) => action.type === TypeAction.Reducer
  ) as ActionReducer | undefined)?.payload

  const reducer: GenericInputStringReducer =
    reducerMaybe === undefined
      ? reducerDefault
      : (values, props) => reducerMaybe(normalize(values, props), props)

  const isEmpty =
    log.length === 0 ||
    !some(
      log,
      (action) =>
        action.type === TypeAction.Option || action.type === TypeAction.Variable
    )

  const options = map(
    filter(log, ({ type }) => type === TypeAction.Option) as ActionOption[],
    ({ payload }) => payload.name
  )

  const variables = map(
    filter(log, ({ type }) => type === TypeAction.Variable) as ActionVariable[],
    ({ payload }) => payload.name
  )

  return {
    type: SYMBOL_INPUT_STRING,
    default: _default,
    description,
    isEmpty,
    reducer,
    options,
    reference,
    repeat,
    variables
  }
}

export const string = builder<Settings>([
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
    [Options.Type]: TypeAction.Repeat,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Keys]: ['repeat'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Conflicts]: [TypeAction.Option, TypeAction.Variable],
    [Options.Interface]: (dispatch) => ({
      repeat() {
        return dispatch<ActionRepeat>({
          type: TypeAction.Repeat,
          payload: undefined
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
    [Options.Conflicts]: [TypeAction.Reducer, TypeAction.Default],
    [Options.Interface]: (dispatch, _, { options }) => ({
      option(value: string) {
        assert.option(value, options)

        return dispatch<ActionOption>({
          type: TypeAction.Option,
          payload: {
            name: value
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
    [Options.Conflicts]: [TypeAction.Reducer, TypeAction.Default],
    [Options.Interface]: (dispatch, _, { variables }) => ({
      variable(value: string, settings: Partial<SettingsVariable> = {}) {
        assert.variable(value, variables)
        assert.variableSettings(settings)

        return dispatch<ActionVariable>({
          type: TypeAction.Variable,
          payload: {
            name: value,
            settings: defaults({}, settings, settingsVariable)
          }
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
    [Options.Conflicts]: [TypeAction.Reducer],
    [Options.Enabled]: (_, state) => !state.isEmpty,
    [Options.Interface]: (dispatch, _, { repeat }) => ({
      default(value: string | string[]) {
        assert.inputStringDefault(value, repeat)

        return dispatch<ActionDefault>({
          type: TypeAction.Default,
          payload: value
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
    [Options.Conflicts]: [TypeAction.Default],
    [Options.Interface]: (dispatch) => ({
      reducer(value: GenericInputStringReducer) {
        assert.function(value)

        return dispatch<ActionReducer>({
          type: TypeAction.Reducer,
          payload: value
        })
      }
    })
  }
])
