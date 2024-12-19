import { builder, Options } from '@escapace/fluent'
import { filter, find, map, reverse, some } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_NUMBER } from '../../types'
import { assert } from '../../utilities/assert'
import { reducer } from './reducer'
import {
  type InputNumberActionDefault,
  type InputNumberActionDescription,
  type InputNumberActionOption,
  type InputNumberActionReference,
  type InputNumberActionRepeat,
  type InputNumberActions,
  type InputNumberActionVariable,
  type InputNumberSettings,
  type InputNumberState,
  InputNumberTypeAction,
} from './types'

const fluentReducer = (log: InputNumberActions): InputNumberState => {
  const reference = (
    find(log, (action) => action.type === InputNumberTypeAction.Reference) as
      | InputNumberActionReference
      | undefined
  )?.payload

  const description = find(
    log,
    (action) => action.type === InputNumberTypeAction.Description,
  )?.payload

  const _default = (
    find(log, (action) => action.type === InputNumberTypeAction.Default) as
      | InputNumberActionDefault
      | undefined
  )?.payload

  const repeat = Boolean(find(log, ({ type }) => type === InputNumberTypeAction.Repeat))

  const isEmpty =
    log.length === 0 ||
    !some(
      log,
      (action) =>
        action.type === InputNumberTypeAction.Option ||
        action.type === InputNumberTypeAction.Variable,
    )

  const rlog = reverse([...log])

  const options = map(
    filter(rlog, ({ type }) => type === InputNumberTypeAction.Option) as InputNumberActionOption[],
    ({ payload }) => payload.name,
  )

  const variables = map(
    filter(
      rlog,
      ({ type }) => type === InputNumberTypeAction.Variable,
    ) as InputNumberActionVariable[],
    ({ payload }) => payload,
  )

  return {
    default: _default,
    description,
    isEmpty,
    options,
    reducer,
    reference,
    repeat,
    type: SYMBOL_INPUT_NUMBER,
    variables,
  }
}

export const number = builder<InputNumberSettings>([
  {
    [Options.Interface]: (dispatch) => ({
      reference(reference: Reference) {
        assert.reference(reference)

        return dispatch<InputNumberActionReference>({
          payload: reference,
          type: InputNumberTypeAction.Reference,
        })
      },
    }),
    [Options.Keys]: ['reference'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputNumberTypeAction.Reference,
  },
  {
    [Options.Dependencies]: [InputNumberTypeAction.Reference],
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<InputNumberActionDescription>({
          payload: description,
          type: InputNumberTypeAction.Description,
        })
      },
    }),
    [Options.Keys]: ['description'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputNumberTypeAction.Description,
  },
  {
    [Options.Conflicts]: [InputNumberTypeAction.Option, InputNumberTypeAction.Variable],
    [Options.Dependencies]: [InputNumberTypeAction.Description],
    [Options.Interface]: (dispatch) => ({
      repeat() {
        return dispatch<InputNumberActionRepeat>({
          payload: undefined,
          type: InputNumberTypeAction.Repeat,
        })
      },
    }),
    [Options.Keys]: ['repeat'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputNumberTypeAction.Repeat,
  },
  {
    [Options.Conflicts]: [InputNumberTypeAction.Default],
    [Options.Dependencies]: [InputNumberTypeAction.Description],
    [Options.Interface]: (dispatch, _, { options }) => ({
      option(value: string) {
        assert.option(value, options)

        return dispatch<InputNumberActionOption>({
          payload: {
            name: value,
          },
          type: InputNumberTypeAction.Option,
        })
      },
    }),
    [Options.Keys]: ['option'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputNumberTypeAction.Option,
  },
  {
    [Options.Conflicts]: [InputNumberTypeAction.Default],
    [Options.Dependencies]: [InputNumberTypeAction.Description],
    [Options.Interface]: (dispatch, _, { variables }) => ({
      variable(value: string) {
        assert.variable(value, variables)

        return dispatch<InputNumberActionVariable>({
          payload: value,
          type: InputNumberTypeAction.Variable,
        })
      },
    }),
    [Options.Keys]: ['variable'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputNumberTypeAction.Variable,
  },
  {
    [Options.Conflicts]: [],
    [Options.Dependencies]: [InputNumberTypeAction.Description],
    [Options.Enabled]: (_, state) => !state.isEmpty,
    [Options.Interface]: (dispatch, _, { repeat }) => ({
      default(value: number | number[]) {
        assert.inputNumberDefault(value, repeat)

        return dispatch<InputNumberActionDefault>({
          payload: value,
          type: InputNumberTypeAction.Default,
        })
      },
    }),
    [Options.Keys]: ['default'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputNumberTypeAction.Default,
  },
])
