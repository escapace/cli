import { builder, Options, SYMBOL_STATE } from '@escapace/fluent'
import { filter, find, map, reduce, some, union } from 'lodash-es'
import { Reference, SYMBOL_COMMAND } from '../types'
import { assert } from '../utility/assert'
import { extract } from '../utility/extract'
import { fallback } from '../utility/fallback'
import { reducer } from './reducer'
import {
  ActionDescription,
  ActionInput,
  ActionName,
  ActionReducer,
  ActionReference,
  Actions,
  ActionSubcommand,
  Command,
  CommandReducer,
  Input,
  Settings,
  State,
  TypeAction
} from './types'

export const fluentReducer = (log: Actions): State => {
  const reference = (find(
    log,
    (action) => action.type === TypeAction.Reference
  ) as ActionReference | undefined)?.payload

  const names = map(
    filter(log, (action) => action.type === TypeAction.Name) as ActionName[],
    ({ payload }) => payload
  )

  const description = (find(
    log,
    (action) => action.type === TypeAction.Description
  ) as ActionDescription | undefined)?.payload

  const isEmpty =
    log.length === 0 ||
    !some(
      log,
      (action) =>
        action.type === TypeAction.Input ||
        action.type === TypeAction.Subcommand ||
        action.type === TypeAction.Reducer
    )

  const { variables, options } = reduce(
    filter(
      log,
      ({ type }) => type === TypeAction.Subcommand || type === TypeAction.Input
    ) as Array<ActionSubcommand | ActionInput>,
    (acc: { variables: string[]; options: string[] }, n) => {
      acc.variables = union(acc.variables, n.payload[SYMBOL_STATE].variables)
      acc.options = union(acc.options, n.payload[SYMBOL_STATE].options)

      return acc
    },
    { variables: [], options: [] }
  )

  const inputs = map(
    filter(log, (action) => action.type === TypeAction.Input) as ActionInput[],
    ({ payload }) => payload
  )

  const commands = map(
    filter(
      log,
      (action) => action.type === TypeAction.Subcommand
    ) as ActionSubcommand[],
    ({ payload }) => payload
  )

  const _reducer: CommandReducer = fallback(
    reducer,
    (find(log, (action) => action.type === TypeAction.Reducer) as
      | ActionReducer
      | undefined)?.payload
  )

  return {
    type: SYMBOL_COMMAND,
    commands,
    description,
    inputs,
    isEmpty,
    names,
    options,
    reducer: _reducer,
    reference,
    variables
  }
}

export const command = builder<Settings>([
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
    [Options.Type]: TypeAction.Name,
    [Options.Keys]: ['name'],
    [Options.Dependencies]: [TypeAction.Reference],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Conflicts]: [TypeAction.Description],
    [Options.Interface]: (dispatch) => ({
      name(name: string) {
        assert.commandName(name)

        return dispatch<ActionName>({
          type: TypeAction.Name,
          payload: name
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Description,
    [Options.Dependencies]: [TypeAction.Name],
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
    [Options.Type]: TypeAction.Input,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Conflicts]: [TypeAction.Subcommand, TypeAction.Reducer],
    [Options.Keys]: ['input'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch, log, state) => ({
      input(value: Input) {
        assert.input(value, { log, state })

        const payload = extract(value)

        return dispatch<ActionInput>({
          type: TypeAction.Input,
          payload
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Subcommand,
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Keys]: ['subcommand'],
    [Options.Conflicts]: [TypeAction.Input, TypeAction.Reducer],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch, log, state) => ({
      subcommand(value: Command) {
        assert.command(value, { log, state })

        const payload = extract(value)

        return dispatch<ActionSubcommand>({
          type: TypeAction.Subcommand,
          payload
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Reducer,
    [Options.Dependencies]: [TypeAction.Description],
    // [Options.Enabled]: (_, { isEmpty }) => !isEmpty,
    [Options.Keys]: ['reducer'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Interface]: (dispatch) => ({
      reducer(value: CommandReducer) {
        assert.function(value)

        return dispatch<ActionReducer>({
          type: TypeAction.Reducer,
          payload: value
        })
      }
    })
  }
])
