/* eslint-disable typescript/no-unsafe-assignment */
import { builder, Options } from '@escapace/fluent'
import { filter, find, some, assign, map, keys, reverse } from 'lodash-es'
import { type Reference, SYMBOL_INPUT_COUNT } from '../../types'
import { assert } from '../../utilities/assert'
import { fallback } from '../../utilities/fallback'
import { reducer } from './reducer'
import {
  type InputCountActionDefault,
  type InputCountActionDescription,
  type InputCountActionOption,
  type InputCountActionReference,
  type InputCountActions,
  type InputCountSettings,
  type InputCountState,
  InputCountTypeAction,
} from './types'

const fluentReducer = (log: InputCountActions): InputCountState => {
  const reference = (
    find(log, (action) => action.type === InputCountTypeAction.Reference) as
      | InputCountActionReference
      | undefined
  )?.payload

  const description = find(
    log,
    (action) => action.type === InputCountTypeAction.Description,
  )?.payload

  const rlog = reverse([...log])

  const _default = fallback(
    0,
    (
      find(log, (action) => action.type === InputCountTypeAction.Default) as
        | InputCountActionDefault
        | undefined
    )?.payload,
  )

  const isEmpty =
    log.length === 0 || !some(log, (action) => action.type === InputCountTypeAction.Option)

  const options = filter(
    rlog,
    ({ type }) => type === InputCountTypeAction.Option,
  ) as InputCountActionOption[]

  const table = assign(
    {},
    ...map(options, ({ payload }): { [key: string]: number } =>
      assign(
        {},
        payload.increase === undefined ? undefined : { [payload.increase]: 1 },
        payload.decrease === undefined ? undefined : { [payload.decrease]: -1 },
      ),
    ),
  )

  return {
    default: _default,
    description,
    isEmpty,
    options: keys(table),
    reducer,
    reference,
    table,
    type: SYMBOL_INPUT_COUNT,
    variables: [],
  }
}

export const count = builder<InputCountSettings>([
  {
    [Options.Interface]: (dispatch) => ({
      reference(reference: Reference) {
        assert.reference(reference)

        return dispatch<InputCountActionReference>({
          payload: reference,
          type: InputCountTypeAction.Reference,
        })
      },
    }),
    [Options.Keys]: ['reference'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputCountTypeAction.Reference,
  },
  {
    [Options.Dependencies]: [InputCountTypeAction.Reference],
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<InputCountActionDescription>({
          payload: description,
          type: InputCountTypeAction.Description,
        })
      },
    }),
    [Options.Keys]: ['description'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputCountTypeAction.Description,
  },
  {
    [Options.Conflicts]: [InputCountTypeAction.Default],
    [Options.Dependencies]: [InputCountTypeAction.Description],
    [Options.Interface]: (dispatch, _, { options }) => ({
      option(...value: [string | undefined, string | undefined]) {
        assert.inputDichotomousOption(value, options)

        return dispatch<InputCountActionOption>({
          payload: {
            decrease: value[1],
            increase: value[0],
          },
          type: InputCountTypeAction.Option,
        })
      },
    }),
    [Options.Keys]: ['option'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputCountTypeAction.Option,
  },
  {
    [Options.Dependencies]: [InputCountTypeAction.Option],
    [Options.Interface]: (dispatch) => ({
      default(value: number) {
        assert.number(value)

        return dispatch<InputCountActionDefault>({
          payload: value,
          type: InputCountTypeAction.Default,
        })
      },
    }),
    [Options.Keys]: ['default'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: InputCountTypeAction.Default,
  },
])
