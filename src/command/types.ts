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
  SharedInitialState,
  SharedState,
  SYMBOL_COMMAND,
  UnionMerge,
  Unwrap,
} from '../types'

export declare const COMMAND_INTERFACE: unique symbol
export declare const COMMAND_SPECIFICATION: unique symbol
export declare const COMMAND_REDUCER: unique symbol

export enum TypeAction {
  Description,
  Input,
  Name,
  Reducer,
  Reference,
  Subcommand,
}

type PayloadActionInput<T extends Action[]> = Payload<$.Values<T>, TypeAction.Input>
type PayloadActionReducer<T extends Action[]> = Payload<$.Values<T>, TypeAction.Reducer>
type PayloadActionSubcommand<T extends Action[]> = Payload<$.Values<T>, TypeAction.Subcommand>

type CastPayloadActionSubcommand<T extends Action[]> = $.Cast<PayloadActionSubcommand<T>, Command>
type CastPayloadInput<T extends Action[]> = $.Cast<PayloadActionInput<T>, Input>

type ValuesInput<T extends Actions, U = CastPayloadInput<T>[typeof SYMBOL_STATE]> = $.Cast<
  UnionMerge<
    U extends { reducer: infer Y; reference: infer X }
      ? Record<$.Cast<X, Reference>, Unwrap<Y>>
      : never
  >,
  object
>

type ValuesCommand<
  T extends Actions,
  U = CastPayloadActionSubcommand<T>[typeof SYMBOL_STATE],
> = U extends {
  reducer: GenericCommandReducer<infer Y>
  reference: infer X
  type: typeof SYMBOL_COMMAND
}
  ? { reference: $.Cast<X, Reference>; value: Y }
  : never

type Values<T extends Actions> = $.If<
  $.Is.Never<PayloadActionInput<T>>,
  $.If<$.Is.Never<PayloadActionSubcommand<T>>, {}, ValuesCommand<T>>,
  ValuesInput<T>
>

export type CommandReducer<T = unknown, U extends Model<State, Actions> = Model<State, Actions>> = (
  values: SimplifyDeep<Values<U['log']>>,
  model: PropertiesCommand,
) => Promise<T> | T

export interface ActionReference<T extends Reference = Reference> {
  payload: T
  type: TypeAction.Reference
}

export interface ActionDescription {
  payload: string
  type: TypeAction.Description
}

export interface ActionName<T extends string = string> {
  payload: T
  type: TypeAction.Name
}

export interface ActionSubcommand<T extends Command = Command> {
  payload: T
  type: TypeAction.Subcommand
}

export interface ActionInput<T extends Input = Input> {
  payload: T
  type: TypeAction.Input
}

export interface ActionReducer<T = unknown> {
  payload: GenericCommandReducer<T>
  type: TypeAction.Reducer
}

export type Actions = Array<
  ActionDescription | ActionInput | ActionName | ActionReducer | ActionReference | ActionSubcommand
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

type InterfaceInput<T extends Model<State, Actions>> = <U extends Input>(
  input: U,
) => $.If<
  InterfaceInputPredicate<
    T['state']['reference'],
    CastPayloadInput<T['log']>[typeof SYMBOL_STATE],
    U[typeof SYMBOL_STATE]
  >,
  unknown,
  Next<Settings, T, ActionInput<U>>
>

type InterfaceSubcommandPredicate<
  T extends Reference | undefined,
  A extends Command[typeof SYMBOL_STATE],
  B extends Command[typeof SYMBOL_STATE],
> = $.Or<
  $.Has<$.Values<A['names']>, $.Values<B['names']>>,
  $.Has<A['reference'] | T, B['reference']>
>

type InterfaceSubcommand<T extends Model<State, Actions>> = <U extends Command>(
  command: U,
) => $.If<
  InterfaceSubcommandPredicate<
    T['state']['reference'],
    CastPayloadActionSubcommand<T['log']>[typeof SYMBOL_STATE],
    U[typeof SYMBOL_STATE]
  >,
  unknown,
  Next<Settings, T, ActionSubcommand<U>>
>

type InterfaceReference<T extends Model<State, Actions>> = <U extends Reference>(
  reference: U,
) => Next<Settings, T, ActionReference<U>>

type InterfaceReducer<T extends Model<State, Actions>> = <U>(
  reducer: CommandReducer<U, T>,
) => Next<Settings, T, ActionReducer<U>>

type InterfaceName<T extends Model<State, Actions>> = <P extends string>(
  name: Exclude<P, $.Values<T['state']['names']>>,
) => Next<Settings, T, ActionName<P>>

type InterfaceDescription<T extends Model<State, Actions>> = (
  description: string,
) => Next<Settings, T, ActionDescription>

interface Interface<T extends Model<State, Actions>> extends FluentInterface<T> {
  description: InterfaceDescription<T>
  input: InterfaceInput<T>
  name: InterfaceName<T>
  reducer: InterfaceReducer<T>
  reference: InterfaceReference<T>
  subcommand: InterfaceSubcommand<T>
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof COMMAND_INTERFACE
  [Options.Reducer]: typeof COMMAND_REDUCER
  [Options.Specification]: typeof COMMAND_SPECIFICATION
  [Options.State]: State
}

export interface State extends SharedState {
  commands: Command[]
  inputs: Input[]
  names: string[]
  reducer: GenericCommandReducer
  type: typeof SYMBOL_COMMAND
}

interface InitialState extends SharedInitialState {
  commands: []
  inputs: []
  names: []
  reducer: GenericCommandReducer
  type: typeof SYMBOL_COMMAND
}

interface Specification<_ extends Model<State, Action[]>> {
  [TypeAction.Reference]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'reference'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Reference
  }

  [TypeAction.Name]: {
    [Options.Conflicts]: typeof TypeAction.Description
    [Options.Dependencies]: typeof TypeAction.Reference
    [Options.Enabled]: $.True
    [Options.Keys]: 'name'
    [Options.Once]: $.False
    [Options.Type]: typeof TypeAction.Name
  }

  [TypeAction.Description]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof TypeAction.Name
    [Options.Enabled]: $.True
    [Options.Keys]: 'description'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Description
  }

  [TypeAction.Input]: {
    [Options.Conflicts]: typeof TypeAction.Reducer | typeof TypeAction.Subcommand
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'input'
    [Options.Once]: $.False
    [Options.Type]: typeof TypeAction.Input
  }

  [TypeAction.Subcommand]: {
    [Options.Conflicts]: typeof TypeAction.Input | typeof TypeAction.Reducer
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'subcommand'
    [Options.Once]: $.False
    [Options.Type]: typeof TypeAction.Subcommand
  }

  [TypeAction.Reducer]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'reducer'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Reducer
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [COMMAND_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [COMMAND_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [COMMAND_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
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
  GenericCommandReducer<ValuesInput<T>>,
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
  GenericCommandReducer<ValuesCommand<T>>,
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
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Input]: {
    inputs: ReducerInputInputs<T>
    isEmpty: false
    options: ReducerInputOptions<T>
    reducer: ReducerInputReducer<T>
    variables: ReducerInputVariables<T>
  }
  [TypeAction.Name]: {
    names: Array<Payload<$.Values<T>, TypeAction.Name>>
  }
  [TypeAction.Reducer]: {
    isEmpty: false
    reducer: PayloadActionReducer<T>
  }
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
  [TypeAction.Subcommand]: {
    commands: ReducerSubcommandCommands<T>
    isEmpty: false
    options: ReducerSubcommandOptions<T>
    reducer: ReducerSubcommandReducer<T>
    variables: ReducerSubcommandVariables<T>
  }
}

interface CommandState extends State {
  isEmpty: false
}

export interface Command extends FluentInterface<Model<CommandState, Actions>> {}

interface ModelCommand {
  readonly log: Command[typeof SYMBOL_LOG]
  readonly state: Command[typeof SYMBOL_STATE]
}

export interface PropertiesCommand extends PropertiesShared {
  readonly model: ModelCommand
}

type GenericCommandReducer<T = unknown> = (values: any, properties: PropertiesCommand) => T

export interface CommandEmpty extends FluentInterface<Model<State, Actions>> {}

export type LookupValues<T extends CommandEmpty> = Values<LookupModel<T>['log']>
