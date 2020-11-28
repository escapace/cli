import { builder, Options } from '@escapace/fluent'
import { defaults, filter, find, map, some, isArray, uniq } from 'lodash-es'
import { Reference, SYMBOL_INPUT_CHOICE, SettingsVariable } from '../../types'
import { assert } from '../../utility/assert'
import { fallback } from '../../utility/fallback'
import {
  ActionChoices,
  ActionDefault,
  ActionDescription,
  ActionOption,
  ActionReference,
  ActionRepeat,
  Actions,
  ActionVariable,
  Settings,
  State,
  TypeAction
} from './types'
import { settingsVariable } from '../../constants'
import { reducer } from './reducer'

export const fluentReducer = (log: Actions): State => {
  const reference = (find(
    log,
    (action) => action.type === TypeAction.Reference
  ) as ActionReference | undefined)?.payload

  const description = (find(
    log,
    (action) => action.type === TypeAction.Description
  ) as ActionDescription | undefined)?.payload

  const choices = fallback(
    [] as [],
    (find(log, (action) => action.type === TypeAction.Choices) as
      | ActionChoices
      | undefined)?.payload
  )

  const _default = (find(
    log,
    (action) => action.type === TypeAction.Default
  ) as ActionDefault | undefined)?.payload

  const repeat = Boolean(find(log, ({ type }) => type === TypeAction.Repeat))

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
    type: SYMBOL_INPUT_CHOICE,
    choices,
    default: _default,
    description,
    isEmpty,
    options,
    reducer,
    reference,
    repeat,
    variables
  }
}

export const choice = builder<Settings>([
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
    [Options.Type]: TypeAction.Choices,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Keys]: ['choices'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch) => ({
      choices(...value: string[]) {
        assert.strings(value)

        return dispatch<ActionChoices>({
          type: TypeAction.Choices,
          payload: value
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Repeat,
    [Options.Dependencies]: [TypeAction.Choices],
    [Options.Keys]: ['repeat'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Conflicts]: [TypeAction.Default],
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
    [Options.Type]: TypeAction.Default,
    [Options.Dependencies]: [TypeAction.Choices],
    [Options.Keys]: ['default'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch, _, { choices, repeat }) => ({
      default(value: string | string[]) {
        assert.inputChoiceDefault(value, choices, repeat)

        return dispatch<ActionDefault>({
          type: TypeAction.Default,
          payload: isArray(value) ? uniq(value) : value
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Option,
    [Options.Dependencies]: [TypeAction.Choices],
    [Options.Keys]: ['option'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
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
    [Options.Dependencies]: [TypeAction.Choices],
    [Options.Keys]: ['variable'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
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
  }
])
