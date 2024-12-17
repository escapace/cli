import { builder, Options } from '@escapace/fluent'
import { filter, find, isArray, map, reverse, some, uniq } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_CHOICE } from '../../types'
import { assert } from '../../utilities/assert'
import { fallback } from '../../utilities/fallback'
import { reducer } from './reducer'
import {
  type ActionChoices,
  type ActionDefault,
  type ActionDescription,
  type ActionOption,
  type ActionReference,
  type ActionRepeat,
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

  const rlog = reverse([...log])

  const choices = fallback(
    [] as [],
    (find(rlog, (action) => action.type === TypeAction.Choices) as ActionChoices | undefined)
      ?.payload,
  )

  const _default = (
    find(log, (action) => action.type === TypeAction.Default) as ActionDefault | undefined
  )?.payload

  const repeat = Boolean(find(log, ({ type }) => type === TypeAction.Repeat))

  const isEmpty = log.length === 0 || !some(log, (action) => action.type === TypeAction.Choices)

  const options = map(
    filter(rlog, ({ type }) => type === TypeAction.Option) as ActionOption[],
    ({ payload }) => payload.name,
  )

  const variables = map(
    filter(rlog, ({ type }) => type === TypeAction.Variable) as ActionVariable[],
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

export const choice = builder<Settings>([
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
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Interface]: (dispatch) => ({
      choices(...value: string[]) {
        assert.strings(value)

        return dispatch<ActionChoices>({
          payload: value,
          type: TypeAction.Choices,
        })
      },
    }),
    [Options.Keys]: ['choices'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Choices,
  },
  {
    [Options.Conflicts]: [TypeAction.Option, TypeAction.Variable],
    [Options.Dependencies]: [TypeAction.Choices],
    [Options.Interface]: (dispatch) => ({
      repeat() {
        return dispatch<ActionRepeat>({
          payload: undefined,
          type: TypeAction.Repeat,
        })
      },
    }),
    [Options.Keys]: ['repeat'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Repeat,
  },
  {
    [Options.Conflicts]: [TypeAction.Default],
    [Options.Dependencies]: [TypeAction.Choices],
    [Options.Interface]: (dispatch, _, { options }) => ({
      option(value: string) {
        assert.option(value, options)

        return dispatch<ActionOption>({
          payload: {
            name: value,
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
    [Options.Dependencies]: [TypeAction.Choices],
    [Options.Interface]: (dispatch, _, { variables }) => ({
      variable(value: string) {
        assert.variable(value, variables)

        return dispatch<ActionVariable>({
          payload: value,
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
    [Options.Dependencies]: [TypeAction.Choices],
    [Options.Enabled]: (log) =>
      some(
        log,
        (action) => action.type === TypeAction.Option || action.type === TypeAction.Variable,
      ),
    [Options.Interface]: (dispatch, _, { choices, repeat }) => ({
      default(value: string | string[]) {
        assert.inputChoiceDefault(value, choices, repeat)

        return dispatch<ActionDefault>({
          payload: isArray(value) ? uniq(value) : value,
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
