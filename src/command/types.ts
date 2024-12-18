import type $ from '@escapace/typelevel'
import type { SimplifyDeep } from 'type-fest'

import type {
  Action,
  FluentInterface,
  Model,
  Next,
  Options,
  Payload,
  SYMBOL_LOG,
  SYMBOL_STATE,
} from '@escapace/fluent'

import type {
  Input,
  LookupModel,
  PropertiesShared,
  Reference,
  StateShared,
  StateSharedInitial,
  SYMBOL_COMMAND,
  UnionMerge,
  Unwrap,
} from '../types'

export declare const COMMAND_INTERFACE: unique symbol
export declare const COMMAND_SPECIFICATION: unique symbol
export declare const COMMAND_REDUCER: unique symbol

export enum CommandTypeAction {
  Description,
  Input,
  Name,
  Reducer,
  Reference,
  Subcommand,
}

type PayloadActionInput<T extends Action[]> = Payload<$.Values<T>, CommandTypeAction.Input>
type PayloadActionReducer<T extends Action[]> = Payload<$.Values<T>, CommandTypeAction.Reducer>
type PayloadActionSubcommand<T extends Action[]> = Payload<
  $.Values<T>,
  CommandTypeAction.Subcommand
>

type CastPayloadActionSubcommand<T extends Action[]> = $.Cast<PayloadActionSubcommand<T>, Command>
type CastPayloadInput<T extends Action[]> = $.Cast<PayloadActionInput<T>, Input>

type ValuesInput<T extends CommandActions, U = CastPayloadInput<T>[typeof SYMBOL_STATE]> = $.Cast<
  UnionMerge<
    U extends { reducer: infer Y; reference: infer X }
      ? Record<$.Cast<X, Reference>, Unwrap<Y>>
      : never
  >,
  object
>

type ValuesCommand<
  T extends CommandActions,
  U = CastPayloadActionSubcommand<T>[typeof SYMBOL_STATE],
> = U extends {
  reducer: CommandGenericReducer<infer Y>
  reference: infer X
  type: typeof SYMBOL_COMMAND
}
  ? { reference: $.Cast<X, Reference>; value: Y }
  : never

type Values<T extends CommandActions> = $.If<
  $.Is.Never<PayloadActionInput<T>>,
  $.If<$.Is.Never<PayloadActionSubcommand<T>>, {}, ValuesCommand<T>>,
  ValuesInput<T>
>

export type CommandReducer<
  T = unknown,
  U extends Model<CommandState, CommandActions> = Model<CommandState, CommandActions>,
> = (values: SimplifyDeep<Values<U['log']>>, model: CommandProperties) => Promise<T> | T

export interface CommandActionReference<T extends Reference = Reference> {
  payload: T
  type: CommandTypeAction.Reference
}

export interface CommandActionDescription {
  payload: string
  type: CommandTypeAction.Description
}

export interface CommandActionName<T extends string = string> {
  payload: T
  type: CommandTypeAction.Name
}

export interface CommandActionSubcommand<T extends Command = Command> {
  payload: T
  type: CommandTypeAction.Subcommand
}

export interface CommandActionInput<T extends Input = Input> {
  payload: T
  type: CommandTypeAction.Input
}

export interface CommandActionReducer<T = unknown> {
  payload: CommandGenericReducer<T>
  type: CommandTypeAction.Reducer
}

export type CommandActions = Array<
  | CommandActionDescription
  | CommandActionInput
  | CommandActionName
  | CommandActionReducer
  | CommandActionReference
  | CommandActionSubcommand
>

type InterfaceInputPredicate<
  T extends Reference | undefined,
  A extends Input[typeof SYMBOL_STATE],
  B extends Input[typeof SYMBOL_STATE],
> = $.Or<
  $.Has<A['reference'] | T, B['reference']>,
  $.Or<
    $.Has<$.Values<A['options']>, $.Values<B['options']>>,
    $.Has<$.Values<A['variables']>, $.Values<B['variables']>>
  >
>

type InterfaceInput<T extends Model<CommandState, CommandActions>> = <U extends Input>(
  input: U,
) => $.If<
  InterfaceInputPredicate<
    T['state']['reference'],
    CastPayloadInput<T['log']>[typeof SYMBOL_STATE],
    U[typeof SYMBOL_STATE]
  >,
  unknown,
  Next<CommandSettings, T, CommandActionInput<U>>
>

type InterfaceSubcommandPredicate<
  T extends Reference | undefined,
  A extends Command[typeof SYMBOL_STATE],
  B extends Command[typeof SYMBOL_STATE],
> = $.Or<
  $.Has<$.Values<A['names']>, $.Values<B['names']>>,
  $.Has<A['reference'] | T, B['reference']>
>

type InterfaceSubcommand<T extends Model<CommandState, CommandActions>> = <U extends Command>(
  command: U,
) => $.If<
  InterfaceSubcommandPredicate<
    T['state']['reference'],
    CastPayloadActionSubcommand<T['log']>[typeof SYMBOL_STATE],
    U[typeof SYMBOL_STATE]
  >,
  unknown,
  Next<CommandSettings, T, CommandActionSubcommand<U>>
>

type InterfaceReference<T extends Model<CommandState, CommandActions>> = <U extends Reference>(
  reference: U,
) => Next<CommandSettings, T, CommandActionReference<U>>

type InterfaceReducer<T extends Model<CommandState, CommandActions>> = <U>(
  reducer: CommandReducer<U, T>,
) => Next<CommandSettings, T, CommandActionReducer<U>>

type InterfaceName<T extends Model<CommandState, CommandActions>> = <P extends string>(
  name: Exclude<P, $.Values<T['state']['names']>>,
) => Next<CommandSettings, T, CommandActionName<P>>

type InterfaceDescription<T extends Model<CommandState, CommandActions>> = (
  description: string,
) => Next<CommandSettings, T, CommandActionDescription>

interface Interface<T extends Model<CommandState, CommandActions>> extends FluentInterface<T> {
  description: InterfaceDescription<T>
  input: InterfaceInput<T>
  name: InterfaceName<T>
  reducer: InterfaceReducer<T>
  reference: InterfaceReference<T>
  subcommand: InterfaceSubcommand<T>
}

export interface CommandSettings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof COMMAND_INTERFACE
  [Options.Reducer]: typeof COMMAND_REDUCER
  [Options.Specification]: typeof COMMAND_SPECIFICATION
  [Options.State]: CommandState
}

export interface CommandState extends StateShared {
  commands: Command[]
  inputs: Input[]
  names: string[]
  reducer: CommandGenericReducer
  type: typeof SYMBOL_COMMAND
}

interface InitialState extends StateSharedInitial {
  commands: []
  inputs: []
  names: []
  reducer: CommandGenericReducer
  type: typeof SYMBOL_COMMAND
}

interface Specification<_ extends Model<CommandState, Action[]>> {
  [CommandTypeAction.Reference]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'reference'
    [Options.Once]: $.True
    [Options.Type]: typeof CommandTypeAction.Reference
  }

  [CommandTypeAction.Name]: {
    [Options.Conflicts]: typeof CommandTypeAction.Description
    [Options.Dependencies]: typeof CommandTypeAction.Reference
    [Options.Enabled]: $.True
    [Options.Keys]: 'name'
    [Options.Once]: $.False
    [Options.Type]: typeof CommandTypeAction.Name
  }

  [CommandTypeAction.Description]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof CommandTypeAction.Name
    [Options.Enabled]: $.True
    [Options.Keys]: 'description'
    [Options.Once]: $.True
    [Options.Type]: typeof CommandTypeAction.Description
  }

  [CommandTypeAction.Input]: {
    [Options.Conflicts]: typeof CommandTypeAction.Reducer | typeof CommandTypeAction.Subcommand
    [Options.Dependencies]: typeof CommandTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'input'
    [Options.Once]: $.False
    [Options.Type]: typeof CommandTypeAction.Input
  }

  [CommandTypeAction.Subcommand]: {
    [Options.Conflicts]: typeof CommandTypeAction.Input | typeof CommandTypeAction.Reducer
    [Options.Dependencies]: typeof CommandTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'subcommand'
    [Options.Once]: $.False
    [Options.Type]: typeof CommandTypeAction.Subcommand
  }

  [CommandTypeAction.Reducer]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof CommandTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'reducer'
    [Options.Once]: $.True
    [Options.Type]: typeof CommandTypeAction.Reducer
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [COMMAND_INTERFACE]: Interface<$.Cast<A, Model<CommandState>>>
    [COMMAND_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [COMMAND_SPECIFICATION]: Specification<$.Cast<A, Model<CommandState>>>
  }
}

// Input

type ReducerInputOptions<T extends Action[]> = Array<
  CastPayloadInput<T>[typeof SYMBOL_STATE] extends {
    options: Array<infer X>
  }
    ? X
    : never
>

type ReducerInputReducer<T extends Action[]> = $.If<
  $.Is.Never<PayloadActionReducer<T>>,
  CommandGenericReducer<ValuesInput<T>>,
  PayloadActionReducer<T>
>

type ReducerInputVariables<T extends Action[]> = Array<
  CastPayloadInput<T>[typeof SYMBOL_STATE] extends {
    variables: Array<infer X>
  }
    ? X
    : never
>

type ReducerInputInputs<T extends Action[]> = Array<CastPayloadInput<T>>

// Subcommand

type ReducerSubcommandCommands<T extends Action[]> = Array<CastPayloadActionSubcommand<T>>

type ReducerSubcommandOptions<T extends Action[]> = Array<
  CastPayloadActionSubcommand<T>[typeof SYMBOL_STATE] extends {
    options: Array<infer X>
  }
    ? X
    : never
>

type ReducerSubcommandReducer<T extends Action[]> = $.If<
  $.Is.Never<PayloadActionReducer<T>>,
  CommandGenericReducer<ValuesCommand<T>>,
  PayloadActionReducer<T>
>

type ReducerSubcommandVariables<T extends Action[]> = Array<
  CastPayloadActionSubcommand<T>[typeof SYMBOL_STATE] extends {
    variables: Array<infer X>
  }
    ? X
    : never
>

interface Reducer<T extends Action[]> {
  [CommandTypeAction.Description]: {
    description: string
  }
  [CommandTypeAction.Input]: {
    inputs: ReducerInputInputs<T>
    isEmpty: false
    options: ReducerInputOptions<T>
    reducer: ReducerInputReducer<T>
    variables: ReducerInputVariables<T>
  }
  [CommandTypeAction.Name]: {
    names: Array<Payload<$.Values<T>, CommandTypeAction.Name>>
  }
  [CommandTypeAction.Reducer]: {
    isEmpty: false
    reducer: PayloadActionReducer<T>
  }
  [CommandTypeAction.Reference]: {
    reference: Payload<$.Values<T>, CommandTypeAction.Reference>
  }
  [CommandTypeAction.Subcommand]: {
    commands: ReducerSubcommandCommands<T>
    isEmpty: false
    options: ReducerSubcommandOptions<T>
    reducer: ReducerSubcommandReducer<T>
    variables: ReducerSubcommandVariables<T>
  }
}

interface CommandStateInitial extends CommandState {
  isEmpty: false
}

export interface Command extends FluentInterface<Model<CommandStateInitial, CommandActions>> {}

interface ModelCommand {
  readonly log: Command[typeof SYMBOL_LOG]
  readonly state: Command[typeof SYMBOL_STATE]
}

export interface CommandProperties extends PropertiesShared {
  readonly model: ModelCommand
}

type CommandGenericReducer<T = unknown> = (values: any, properties: CommandProperties) => T

export interface CommandEmpty extends FluentInterface<Model<CommandState, CommandActions>> {}

export type CommandValuesLookup<T extends CommandEmpty> = Values<LookupModel<T>['log']>
