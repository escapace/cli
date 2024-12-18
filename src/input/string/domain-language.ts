import { builder, Options } from '@escapace/fluent'
import { filter, find, map, reverse, some } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_STRING } from '../../types'
import { assert } from '../../utilities/assert'
import { reducer } from './reducer'
import {
  type InputStringActionDefault,
  type InputStringActionDescription,
  type InputStringActionOption,
  type InputStringActionReference,
  type InputStringActionRepeat,
  type InputStringActions,
  type InputStringActionVariable,
  type InputStringSettings,
  type InputStringState,
  InputStringTypeAction,
} from './types'

const fluentReducer = (log: InputStringActions): InputStringState => {
  const reference = (
    find(log, (action) => action.type === InputStringTypeAction.Reference) as
      | InputStringActionReference
      | undefined
  )?.payload

  const description = find(
    log,
    (action) => action.type === InputStringTypeAction.Description,
  )?.payload

  const _default = (
    find(log, (action) => action.type === InputStringTypeAction.Default) as
      | InputStringActionDefault
      | undefined
  )?.payload

  const repeat = Boolean(find(log, ({ type }) => type === InputStringTypeAction.Repeat))

  const isEmpty =
    log.length === 0 ||
    !some(
      log,
      (action) =>
        action.type === InputStringTypeAction.Option ||
        action.type === InputStringTypeAction.Variable,
    )

  const rlog = reverse([...log])

  const options = map(
    filter(rlog, ({ type }) => type === InputStringTypeAction.Option) as InputStringActionOption[],
    ({ payload }) => payload.name,
  )

  const variables = map(
    filter(
      rlog,
      ({ type }) => type === InputStringTypeAction.Variable,
    ) as InputStringActionVariable[],
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
    type: SYMBOL_INPUT_STRING,
    variables,
  }
}

export const string = builder<InputStringSettings>([
  {
    [Options.Interface]: (dispatch) => ({
      reference(reference: Reference) {
        assert.reference(reference)

        return dispatch<InputStringActionReference>({
          payload: reference,
          type: InputStringTypeAction.Reference,
        })
      },
    }),
    [Options.Keys]: ['reference'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputStringTypeAction.Reference,
  },
  {
    [Options.Dependencies]: [InputStringTypeAction.Reference],
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<InputStringActionDescription>({
          payload: description,
          type: InputStringTypeAction.Description,
        })
      },
    }),
    [Options.Keys]: ['description'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputStringTypeAction.Description,
  },
  {
    [Options.Conflicts]: [InputStringTypeAction.Option, InputStringTypeAction.Variable],
    [Options.Dependencies]: [InputStringTypeAction.Description],
    [Options.Interface]: (dispatch) => ({
      repeat() {
        return dispatch<InputStringActionRepeat>({
          payload: undefined,
          type: InputStringTypeAction.Repeat,
        })
      },
    }),
    [Options.Keys]: ['repeat'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputStringTypeAction.Repeat,
  },
  {
    [Options.Conflicts]: [InputStringTypeAction.Default],
    [Options.Dependencies]: [InputStringTypeAction.Description],
    [Options.Interface]: (dispatch, _, { options }) => ({
      option(value: string) {
        assert.option(value, options)

        return dispatch<InputStringActionOption>({
          payload: {
            name: value,
          },
          type: InputStringTypeAction.Option,
        })
      },
    }),
    [Options.Keys]: ['option'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputStringTypeAction.Option,
  },
  {
    [Options.Conflicts]: [InputStringTypeAction.Default],
    [Options.Dependencies]: [InputStringTypeAction.Description],
    [Options.Interface]: (dispatch, _, { variables }) => ({
      variable(value: string) {
        assert.variable(value, variables)

        return dispatch<InputStringActionVariable>({
          payload: value,
          type: InputStringTypeAction.Variable,
        })
      },
    }),
    [Options.Keys]: ['variable'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputStringTypeAction.Variable,
  },
  {
    [Options.Conflicts]: [],
    [Options.Dependencies]: [InputStringTypeAction.Description],
    [Options.Enabled]: (_, state) => !state.isEmpty,
    [Options.Interface]: (dispatch, _, { repeat }) => ({
      default(value: string | string[]) {
        assert.inputStringDefault(value, repeat)

        return dispatch<InputStringActionDefault>({
          payload: value,
          type: InputStringTypeAction.Default,
        })
      },
    }),
    [Options.Keys]: ['default'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputStringTypeAction.Default,
  },
])
