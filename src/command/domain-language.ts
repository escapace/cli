import { builder, Options, SYMBOL_STATE } from '@escapace/fluent'
import { filter, find, map, reduce, reverse, some, union } from 'lodash-es'
import { type Reference, SYMBOL_COMMAND, type Input } from '../types'
import { assert } from '../utilities/assert'
import { extract } from '../utilities/extract'
import { fallback } from '../utilities/fallback'
import { reducer } from './reducer'
import {
  type CommandActionDescription,
  type CommandActionInput,
  type CommandActionName,
  type CommandActionReducer,
  type CommandActionReference,
  type CommandActions,
  type CommandActionSubcommand,
  type Command,
  type CommandReducer,
  type CommandSettings,
  type CommandState,
  TypeAction,
} from './types'

const fluentReducer = (log: CommandActions): CommandState => {
  const reference = (
    find(log, (action) => action.type === TypeAction.Reference) as
      | CommandActionReference
      | undefined
  )?.payload

  const rlog = reverse([...log])

  const names = map(
    filter(rlog, (action) => action.type === TypeAction.Name) as CommandActionName[],
    ({ payload }) => payload,
  )

  const description = find(log, (action) => action.type === TypeAction.Description)?.payload

  const isEmpty =
    log.length === 0 ||
    !some(
      log,
      (action) =>
        action.type === TypeAction.Input ||
        action.type === TypeAction.Subcommand ||
        action.type === TypeAction.Reducer,
    )

  const { options, variables } = reduce(
    filter(
      rlog,
      ({ type }) => type === TypeAction.Subcommand || type === TypeAction.Input,
    ) as Array<CommandActionInput | CommandActionSubcommand>,
    (accumulator: { options: string[]; variables: string[] }, n) => {
      accumulator.variables = union(accumulator.variables, n.payload[SYMBOL_STATE].variables)
      accumulator.options = union(accumulator.options, n.payload[SYMBOL_STATE].options)

      return accumulator
    },
    { options: [], variables: [] },
  )

  const inputs = map(
    filter(rlog, (action) => action.type === TypeAction.Input) as CommandActionInput[],
    ({ payload }) => payload,
  )

  const commands = map(
    filter(rlog, (action) => action.type === TypeAction.Subcommand) as CommandActionSubcommand[],
    ({ payload }) => payload,
  )

  const _reducer: CommandReducer = fallback(
    reducer,
    (find(log, (action) => action.type === TypeAction.Reducer) as CommandActionReducer | undefined)
      ?.payload,
  )

  return {
    commands,
    description,
    inputs,
    isEmpty,
    names,
    options,
    reducer: _reducer,
    reference,
    type: SYMBOL_COMMAND,
    variables,
  }
}

export const command = builder<CommandSettings>([
  {
    [Options.Interface]: (dispatch) => ({
      reference(reference: Reference) {
        assert.reference(reference)

        return dispatch<CommandActionReference>({
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
    [Options.Conflicts]: [TypeAction.Description],
    [Options.Dependencies]: [TypeAction.Reference],
    [Options.Interface]: (dispatch) => ({
      name(name: string) {
        assert.commandName(name)

        return dispatch<CommandActionName>({
          payload: name,
          type: TypeAction.Name,
        })
      },
    }),
    [Options.Keys]: ['name'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Name,
  },
  {
    [Options.Dependencies]: [TypeAction.Name],
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<CommandActionDescription>({
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
    [Options.Conflicts]: [TypeAction.Subcommand, TypeAction.Reducer],
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Interface]: (dispatch, log, state) => ({
      input(value: Input) {
        assert.input(value, { log, state })

        const payload = extract(value)

        return dispatch<CommandActionInput>({
          payload,
          type: TypeAction.Input,
        })
      },
    }),
    [Options.Keys]: ['input'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Input,
  },
  {
    [Options.Conflicts]: [TypeAction.Input, TypeAction.Reducer],
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Interface]: (dispatch, log, state) => ({
      subcommand(value: Command) {
        assert.command(value, { log, state })

        const payload = extract(value)

        return dispatch<CommandActionSubcommand>({
          payload,
          type: TypeAction.Subcommand,
        })
      },
    }),
    [Options.Keys]: ['subcommand'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: TypeAction.Subcommand,
  },
  {
    [Options.Dependencies]: [TypeAction.Description],
    [Options.Type]: TypeAction.Reducer,
    // [Options.Enabled]: (_, { isEmpty }) => !isEmpty,
    [Options.Interface]: (dispatch) => ({
      reducer(value: CommandReducer) {
        assert.function(value)

        return dispatch<CommandActionReducer>({
          payload: value,
          type: TypeAction.Reducer,
        })
      },
    }),
    [Options.Keys]: ['reducer'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
  },
])
