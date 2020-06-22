import $ from '@escapace/typelevel'

import {
  Action,
  Payload,
  FluentInterface,
  Model,
  Next,
  Options,
  SYMBOL_STATE
} from '@escapace/fluent'

import {
  SYMBOL_COMMAND,
  Reference,
  SharedState,
  SharedInitialState
} from '../types'

import { InputBoolean } from '../input/boolean/types'
import { InputChoice } from '../input/choice/types'
import { InputCount } from '../input/count/types'
import { InputString } from '../input/string/types'

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

export type Input = InputBoolean | InputChoice | InputCount | InputString

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Unwrap<T> = T extends (...args: any) => infer U
  ? U extends PromiseLike<infer R>
    ? R
    : U
  : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type ValuesInput<
  T extends Actions,
  U = $.Cast<Payload<T, TypeAction.Input>, Input>[typeof SYMBOL_STATE]
> = $.Cast<
  UnionToIntersection<
    U extends { reference: infer X; reducer: infer Y }
      ? Record<$.Cast<X, Reference>, Unwrap<Y>>
      : never
  > & { _: string[] },
  object
>

type ValuesCommand<
  T extends Actions,
  U = $.Cast<Payload<T, TypeAction.Subcommand>, Command>[typeof SYMBOL_STATE]
> = U extends {
  // UnionToIntersection<
  type: typeof SYMBOL_COMMAND
  reference: infer X
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reducer: CommandReducer<infer Y, any>
}
  ? { reference: $.Cast<X, Reference>; value: Y }
  : never
// >

type Values<T extends Actions> = $.If<
  $.Is.Never<Payload<T, TypeAction.Input, never>>,
  ValuesCommand<T>,
  ValuesInput<T>
>

export type CommandReducer<
  T = unknown,
  U extends Model<State, Actions> = Model<State, Actions>
> = (
  values: Values<U['log']>,
  model: { state: U['state']; log: Array<U['log']> }
) => T | Promise<T>

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
  payload: CommandReducer<T>
}

export type Actions =
  | ActionDescription
  | ActionInput
  | ActionName
  | ActionReducer
  | ActionReference
  | ActionSubcommand

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
      Payload<T['log'], TypeAction.Input>,
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
      Payload<T['log'], TypeAction.Subcommand>,
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
  reducer: Function
  commands: Command[]
  inputs: Input[]
}

export interface InitialState extends SharedInitialState {
  type: typeof SYMBOL_COMMAND
  names: []
  reducer: Function
  commands: []
  inputs: []
}

export interface Specification<T extends Model<State>> {
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
    [Options.Enabled]: $.Equal<T['state']['isEmpty'], false>
    [Options.Keys]: 'reducer'
    [Options.Conflicts]: never
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [COMMAND_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [COMMAND_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [COMMAND_REDUCER]: Reducer<$.Cast<A, Action>>
  }
}

export interface Reducer<T extends Action> {
  [TypeAction.Reference]: {
    reference: Payload<T, TypeAction.Reference>
  }
  [TypeAction.Name]: {
    names: Array<Payload<T, TypeAction.Name>>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Subcommand]: {
    isEmpty: false
    commands: Array<$.Cast<Payload<T, TypeAction.Subcommand>, Command>>
    options: Array<
      $.Cast<
        Payload<T, TypeAction.Subcommand>,
        Command
      >[typeof SYMBOL_STATE] extends {
        options: Array<infer X>
      }
        ? X
        : never
    >
    variables: Array<
      $.Cast<
        Payload<T, TypeAction.Subcommand>,
        Command
      >[typeof SYMBOL_STATE] extends {
        variables: Array<infer X>
      }
        ? X
        : never
    >
    reducer: $.If<
      $.Is.Never<Payload<T, TypeAction.Reducer>>,
      CommandReducer<ValuesCommand<T>>,
      Payload<T, TypeAction.Reducer>
    >
  }
  [TypeAction.Input]: {
    isEmpty: false
    inputs: Array<$.Cast<Payload<T, TypeAction.Input>, Input>>
    options: Array<
      $.Cast<Payload<T, TypeAction.Input>, Input>[typeof SYMBOL_STATE] extends {
        options: Array<infer X>
      }
        ? X
        : never
    >
    variables: Array<
      $.Cast<Payload<T, TypeAction.Input>, Input>[typeof SYMBOL_STATE] extends {
        variables: Array<infer X>
      }
        ? X
        : never
    >
    reducer: $.If<
      $.Is.Never<Payload<T, TypeAction.Reducer>>,
      CommandReducer<ValuesInput<T>>,
      Payload<T, TypeAction.Reducer>
    >
  }
  [TypeAction.Reducer]: {
    reducer: Payload<T, TypeAction.Reducer>
  }
}

export interface CommandState extends State {
  isEmpty: false
}

export interface Command
  extends FluentInterface<Model<CommandState, Actions>> {}
