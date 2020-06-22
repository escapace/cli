import $ from '@escapace/typelevel'

import {
  Action,
  Payload,
  FluentInterface,
  Model,
  Next,
  Options,
  SYMBOL_STATE,
  SYMBOL_LOG
} from '@escapace/fluent'

import {
  Input,
  LookupModel,
  Reference,
  SYMBOL_COMMAND,
  PropsShared,
  UnionMerge,
  Unwrap,
  SharedInitialState,
  SharedState
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
  Subcommand
}

type ValuesInput<
  T extends Actions,
  U = $.Cast<Payload<$.Values<T>, TypeAction.Input>, Input>[typeof SYMBOL_STATE]
> = $.Cast<
  UnionMerge<
    U extends { reference: infer X; reducer: infer Y }
      ? Record<$.Cast<X, Reference>, Unwrap<Y>>
      : never
  >,
  object
>

type ValuesCommand<
  T extends Actions,
  U = $.Cast<
    Payload<$.Values<T>, TypeAction.Subcommand>,
    Command
  >[typeof SYMBOL_STATE]
> = U extends {
  type: typeof SYMBOL_COMMAND
  reference: infer X
  reducer: GenericCommandReducer<infer Y>
}
  ? { reference: $.Cast<X, Reference>; value: Y }
  : never

type Values<T extends Actions> = $.If<
  $.Is.Never<Payload<$.Values<T>, TypeAction.Input, never>>,
  $.If<
    $.Is.Never<Payload<$.Values<T>, TypeAction.Subcommand, never>>,
    {},
    ValuesCommand<T>
  >,
  ValuesInput<T>
>

export type CommandReducer<
  T = unknown,
  U extends Model<State, Actions> = Model<State, Actions>
> = (values: Values<U['log']>, model: PropsCommand) => T | Promise<T>

export interface ActionReference<T extends Reference = Reference> {
  type: TypeAction.Reference
  payload: T
}

export interface ActionDescription {
  type: TypeAction.Description
  payload: string
}

export interface ActionName<T extends string = string> {
  type: TypeAction.Name
  payload: T
}

export interface ActionSubcommand<T extends Command = Command> {
  type: TypeAction.Subcommand
  payload: T
}

export interface ActionInput<T extends Input = Input> {
  type: TypeAction.Input
  payload: T
}

export interface ActionReducer<T = unknown> {
  type: TypeAction.Reducer
  payload: GenericCommandReducer<T>
}

export type Actions = Array<
  | ActionDescription
  | ActionInput
  | ActionName
  | ActionReducer
  | ActionReference
  | ActionSubcommand
>

export interface Interface<T extends Model<State, Actions>>
  extends FluentInterface<T> {
  reference: <U extends Reference>(
    reference: U
  ) => Next<Settings, T, ActionReference<U>>
  name: <P extends string>(
    name: Exclude<P, $.Values<T['state']['names']>>
  ) => Next<Settings, T, ActionName<P>>
  description: (description: string) => Next<Settings, T, ActionDescription>
  input: <
    U extends Input,
    A extends Input[typeof SYMBOL_STATE] = $.Cast<
      Payload<$.Values<T['log']>, TypeAction.Input>,
      Input
    >[typeof SYMBOL_STATE],
    B extends Input[typeof SYMBOL_STATE] = U[typeof SYMBOL_STATE]
  >(
    input: U
  ) => $.If<
    $.Or<
      $.Has<A['reference'] | T['state']['reference'], B['reference']>,
      $.Or<
        $.Has<$.Values<A['options']>, $.Values<B['options']>>,
        $.Has<$.Values<A['variables']>, $.Values<B['variables']>>
      >
    >,
    unknown,
    Next<Settings, T, ActionInput<U>>
  >
  subcommand: <
    U extends Command,
    A extends Command[typeof SYMBOL_STATE] = $.Cast<
      Payload<$.Values<T['log']>, TypeAction.Subcommand>,
      Command
    >[typeof SYMBOL_STATE],
    B extends Command[typeof SYMBOL_STATE] = U[typeof SYMBOL_STATE]
  >(
    command: U
  ) => $.If<
    $.Or<
      $.Has<$.Values<A['names']>, $.Values<B['names']>>,
      $.Has<A['reference'] | T['state']['reference'], B['reference']>
    >,
    unknown,
    Next<Settings, T, ActionSubcommand<U>>
  >
  reducer: <U>(
    reducer: CommandReducer<U, T>
  ) => Next<Settings, T, ActionReducer<U>>
}

export interface Settings {
  [Options.Interface]: typeof COMMAND_INTERFACE
  [Options.Specification]: typeof COMMAND_SPECIFICATION
  [Options.Reducer]: typeof COMMAND_REDUCER
  [Options.InitialState]: InitialState
  [Options.State]: State
}

export interface State extends SharedState {
  type: typeof SYMBOL_COMMAND
  names: string[]
  reducer: GenericCommandReducer
  commands: Command[]
  inputs: Input[]
}

export interface InitialState extends SharedInitialState {
  type: typeof SYMBOL_COMMAND
  names: []
  reducer: GenericCommandReducer
  commands: []
  inputs: []
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Specification<_ extends Model<State>> {
  [TypeAction.Reference]: {
    [Options.Type]: typeof TypeAction.Reference
    [Options.Once]: $.True
    [Options.Dependencies]: never
    [Options.Keys]: 'reference'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [TypeAction.Name]: {
    [Options.Type]: typeof TypeAction.Name
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Reference
    [Options.Keys]: 'name'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Description
  }

  [TypeAction.Description]: {
    [Options.Type]: typeof TypeAction.Description
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.Name
    [Options.Keys]: 'description'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [TypeAction.Input]: {
    [Options.Type]: typeof TypeAction.Input
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'input'
    [Options.Enabled]: $.True
    [Options.Conflicts]:
      | typeof TypeAction.Subcommand
      | typeof TypeAction.Reducer
  }

  [TypeAction.Subcommand]: {
    [Options.Type]: typeof TypeAction.Subcommand
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'subcommand'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Input | typeof TypeAction.Reducer
  }

  [TypeAction.Reducer]: {
    [Options.Type]: typeof TypeAction.Reducer
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'reducer'
    [Options.Conflicts]: never
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [COMMAND_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [COMMAND_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [COMMAND_REDUCER]: Reducer<$.Cast<A, Action[]>>
  }
}

export interface Reducer<T extends Action[]> {
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
  [TypeAction.Name]: {
    names: Array<Payload<$.Values<T>, TypeAction.Name>>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Subcommand]: {
    isEmpty: false
    commands: Array<
      $.Cast<Payload<$.Values<T>, TypeAction.Subcommand>, Command>
    >
    options: Array<
      $.Cast<
        Payload<$.Values<T>, TypeAction.Subcommand>,
        Command
      >[typeof SYMBOL_STATE] extends {
        options: Array<infer X>
      }
        ? X
        : never
    >
    variables: Array<
      $.Cast<
        Payload<$.Values<T>, TypeAction.Subcommand>,
        Command
      >[typeof SYMBOL_STATE] extends {
        variables: Array<infer X>
      }
        ? X
        : never
    >
    reducer: $.If<
      $.Is.Never<Payload<$.Values<T>, TypeAction.Reducer>>,
      GenericCommandReducer<ValuesCommand<T>>,
      Payload<$.Values<T>, TypeAction.Reducer>
    >
  }
  [TypeAction.Input]: {
    isEmpty: false
    inputs: Array<$.Cast<Payload<$.Values<T>, TypeAction.Input>, Input>>
    options: Array<
      $.Cast<
        Payload<$.Values<T>, TypeAction.Input>,
        Input
      >[typeof SYMBOL_STATE] extends {
        options: Array<infer X>
      }
        ? X
        : never
    >
    variables: Array<
      $.Cast<
        Payload<$.Values<T>, TypeAction.Input>,
        Input
      >[typeof SYMBOL_STATE] extends {
        variables: Array<infer X>
      }
        ? X
        : never
    >
    reducer: $.If<
      $.Is.Never<Payload<$.Values<T>, TypeAction.Reducer>>,
      GenericCommandReducer<ValuesInput<T>>,
      Payload<$.Values<T>, TypeAction.Reducer>
    >
  }
  [TypeAction.Reducer]: {
    isEmpty: false
    reducer: Payload<$.Values<T>, TypeAction.Reducer>
  }
}

export interface CommandState extends State {
  isEmpty: false
}

export interface Command
  extends FluentInterface<Model<CommandState, Actions>> {}

export interface ModelCommand {
  readonly state: Command[typeof SYMBOL_STATE]
  readonly log: Command[typeof SYMBOL_LOG]
}

export interface PropsCommand extends PropsShared {
  readonly model: ModelCommand
}

export type GenericCommandReducer<T = unknown> = (
  values: any,
  props: PropsCommand
) => T

export interface CommandEmpty extends FluentInterface<Model<State, Actions>> {}

export type LookupValues<T extends CommandEmpty> = Values<LookupModel<T>['log']>
