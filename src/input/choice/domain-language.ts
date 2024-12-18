import { builder, Options } from '@escapace/fluent'
import { filter, find, isArray, map, reverse, some, uniq } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_CHOICE } from '../../types'
import { assert } from '../../utilities/assert'
import { fallback } from '../../utilities/fallback'
import { reducer } from './reducer'
import {
  type InputChoiceActionChoices,
  type InputChoiceActionDefault,
  type InputChoiceActionDescription,
  type InputChoiceActionOption,
  type InputChoiceActionReference,
  type InputChoiceActionRepeat,
  type InputChoiceActions,
  type InputChoiceActionVariable,
  type InputChoiceSettings,
  type InputChoiceState,
  InputChoiceTypeAction,
} from './types'

const fluentReducer = (log: InputChoiceActions): InputChoiceState => {
  const reference = (
    find(log, (action) => action.type === InputChoiceTypeAction.Reference) as
      | InputChoiceActionReference
      | undefined
  )?.payload

  const description = find(
    log,
    (action) => action.type === InputChoiceTypeAction.Description,
  )?.payload

  const rlog = reverse([...log])

  const choices = fallback(
    [] as [],
    (
      find(rlog, (action) => action.type === InputChoiceTypeAction.Choices) as
        | InputChoiceActionChoices
        | undefined
    )?.payload,
  )

  const _default = (
    find(log, (action) => action.type === InputChoiceTypeAction.Default) as
      | InputChoiceActionDefault
      | undefined
  )?.payload

  const repeat = Boolean(find(log, ({ type }) => type === InputChoiceTypeAction.Repeat))

  const isEmpty =
    log.length === 0 || !some(log, (action) => action.type === InputChoiceTypeAction.Choices)

  const options = map(
    filter(rlog, ({ type }) => type === InputChoiceTypeAction.Option) as InputChoiceActionOption[],
    ({ payload }) => payload.name,
  )

  const variables = map(
    filter(
      rlog,
      ({ type }) => type === InputChoiceTypeAction.Variable,
    ) as InputChoiceActionVariable[],
    ({ payload }) => payload,
  )

  return {
    choices,
    default: _default,
    description,
    isEmpty,
    options,
    reducer,
    reference,
    repeat,
    type: SYMBOL_INPUT_CHOICE,
    variables,
  }
}

export const choice = builder<InputChoiceSettings>([
  {
    [Options.Interface]: (dispatch) => ({
      reference(reference: Reference) {
        assert.reference(reference)

        return dispatch<InputChoiceActionReference>({
          payload: reference,
          type: InputChoiceTypeAction.Reference,
        })
      },
    }),
    [Options.Keys]: ['reference'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputChoiceTypeAction.Reference,
  },
  {
    [Options.Dependencies]: [InputChoiceTypeAction.Reference],
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<InputChoiceActionDescription>({
          payload: description,
          type: InputChoiceTypeAction.Description,
        })
      },
    }),
    [Options.Keys]: ['description'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputChoiceTypeAction.Description,
  },
  {
    [Options.Dependencies]: [InputChoiceTypeAction.Description],
    [Options.Interface]: (dispatch) => ({
      choices(...value: string[]) {
        assert.strings(value)

        return dispatch<InputChoiceActionChoices>({
          payload: value,
          type: InputChoiceTypeAction.Choices,
        })
      },
    }),
    [Options.Keys]: ['choices'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputChoiceTypeAction.Choices,
  },
  {
    [Options.Conflicts]: [InputChoiceTypeAction.Option, InputChoiceTypeAction.Variable],
    [Options.Dependencies]: [InputChoiceTypeAction.Choices],
    [Options.Interface]: (dispatch) => ({
      repeat() {
        return dispatch<InputChoiceActionRepeat>({
          payload: undefined,
          type: InputChoiceTypeAction.Repeat,
        })
      },
    }),
    [Options.Keys]: ['repeat'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputChoiceTypeAction.Repeat,
  },
  {
    [Options.Conflicts]: [InputChoiceTypeAction.Default],
    [Options.Dependencies]: [InputChoiceTypeAction.Choices],
    [Options.Interface]: (dispatch, _, { options }) => ({
      option(value: string) {
        assert.option(value, options)

        return dispatch<InputChoiceActionOption>({
          payload: {
            name: value,
          },
          type: InputChoiceTypeAction.Option,
        })
      },
    }),
    [Options.Keys]: ['option'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputChoiceTypeAction.Option,
  },
  {
    [Options.Conflicts]: [InputChoiceTypeAction.Default],
    [Options.Dependencies]: [InputChoiceTypeAction.Choices],
    [Options.Interface]: (dispatch, _, { variables }) => ({
      variable(value: string) {
        assert.variable(value, variables)

        return dispatch<InputChoiceActionVariable>({
          payload: value,
          type: InputChoiceTypeAction.Variable,
        })
      },
    }),
    [Options.Keys]: ['variable'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputChoiceTypeAction.Variable,
  },
  {
    [Options.Dependencies]: [InputChoiceTypeAction.Choices],
    [Options.Enabled]: (log) =>
      some(
        log,
        (action) =>
          action.type === InputChoiceTypeAction.Option ||
          action.type === InputChoiceTypeAction.Variable,
      ),
    [Options.Interface]: (dispatch, _, { choices, repeat }) => ({
      default(value: string | string[]) {
        assert.inputChoiceDefault(value, choices, repeat)

        return dispatch<InputChoiceActionDefault>({
          payload: isArray(value) ? uniq(value) : value,
          type: InputChoiceTypeAction.Default,
        })
      },
    }),
    [Options.Keys]: ['default'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputChoiceTypeAction.Default,
  },
])
