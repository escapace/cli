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
  CommandTypeAction,
} from './types'

const fluentReducer = (log: CommandActions): CommandState => {
  const reference = (
    find(log, (action) => action.type === CommandTypeAction.Reference) as
      | CommandActionReference
      | undefined
  )?.payload

  const rlog = reverse([...log])

  const names = map(
    filter(rlog, (action) => action.type === CommandTypeAction.Name) as CommandActionName[],
    ({ payload }) => payload,
  )

  const description = find(log, (action) => action.type === CommandTypeAction.Description)?.payload

  const isEmpty =
    log.length === 0 ||
    !some(
      log,
      (action) =>
        action.type === CommandTypeAction.Input ||
        action.type === CommandTypeAction.Subcommand ||
        action.type === CommandTypeAction.Reducer,
    )

  const { options, variables } = reduce(
    filter(
      rlog,
      ({ type }) => type === CommandTypeAction.Subcommand || type === CommandTypeAction.Input,
    ) as Array<CommandActionInput | CommandActionSubcommand>,
    (accumulator: { options: string[]; variables: string[] }, n) => {
      accumulator.variables = union(accumulator.variables, n.payload[SYMBOL_STATE].variables)
      accumulator.options = union(accumulator.options, n.payload[SYMBOL_STATE].options)

      return accumulator
    },
    { options: [], variables: [] },
  )

  const inputs = map(
    filter(rlog, (action) => action.type === CommandTypeAction.Input) as CommandActionInput[],
    ({ payload }) => payload,
  )

  const commands = map(
    filter(
      rlog,
      (action) => action.type === CommandTypeAction.Subcommand,
    ) as CommandActionSubcommand[],
    ({ payload }) => payload,
  )

  const _reducer: CommandReducer = fallback(
    reducer,
    (
      find(log, (action) => action.type === CommandTypeAction.Reducer) as
        | CommandActionReducer
        | undefined
    )?.payload,
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
          type: CommandTypeAction.Reference,
        })
      },
    }),
    [Options.Keys]: ['reference'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: CommandTypeAction.Reference,
  },
  {
    [Options.Conflicts]: [CommandTypeAction.Description],
    [Options.Dependencies]: [CommandTypeAction.Reference],
    [Options.Interface]: (dispatch) => ({
      name(name: string) {
        assert.commandName(name)

        return dispatch<CommandActionName>({
          payload: name,
          type: CommandTypeAction.Name,
        })
      },
    }),
    [Options.Keys]: ['name'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: CommandTypeAction.Name,
  },
  {
    [Options.Dependencies]: [CommandTypeAction.Name],
    [Options.Interface]: (dispatch) => ({
      description(description: string) {
        assert.string(description)

        return dispatch<CommandActionDescription>({
          payload: description,
          type: CommandTypeAction.Description,
        })
      },
    }),
    [Options.Keys]: ['description'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: CommandTypeAction.Description,
  },
  {
    [Options.Conflicts]: [CommandTypeAction.Subcommand, CommandTypeAction.Reducer],
    [Options.Dependencies]: [CommandTypeAction.Description],
    [Options.Interface]: (dispatch, log, state) => ({
      input(value: Input) {
        assert.input(value, { log, state })

        const payload = extract(value)

        return dispatch<CommandActionInput>({
          payload,
          type: CommandTypeAction.Input,
        })
      },
    }),
    [Options.Keys]: ['input'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: CommandTypeAction.Input,
  },
  {
    [Options.Conflicts]: [CommandTypeAction.Input, CommandTypeAction.Reducer],
    [Options.Dependencies]: [CommandTypeAction.Description],
    [Options.Interface]: (dispatch, log, state) => ({
      subcommand(value: Command) {
        assert.command(value, { log, state })

        const payload = extract(value)

        return dispatch<CommandActionSubcommand>({
          payload,
          type: CommandTypeAction.Subcommand,
        })
      },
    }),
    [Options.Keys]: ['subcommand'],
    [Options.Once]: false,
    [Options.Reducer]: fluentReducer,
    [Options.Type]: CommandTypeAction.Subcommand,
  },
  {
    [Options.Dependencies]: [CommandTypeAction.Description],
    [Options.Type]: CommandTypeAction.Reducer,
    // [Options.Enabled]: (_, { isEmpty }) => !isEmpty,
    [Options.Interface]: (dispatch) => ({
      reducer(value: CommandReducer) {
        assert.function(value)

        return dispatch<CommandActionReducer>({
          payload: value,
          type: CommandTypeAction.Reducer,
        })
      },
    }),
    [Options.Keys]: ['reducer'],
    [Options.Once]: true,
    [Options.Reducer]: fluentReducer,
  },
])
