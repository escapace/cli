import type $ from '@escapace/typelevel'

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
  InputType,
  InputPropertiesShared,
  Reference,
  StateSharedInitial,
  StateShared,
  SYMBOL_INPUT_BOOLEAN,
} from '../../types'

export declare const INPUT_BOOLEAN_INTERFACE: unique symbol
export declare const INPUT_BOOLEAN_SPECIFICATION: unique symbol
export declare const INPUT_BOOLEAN_REDUCER: unique symbol

export enum TypeAction {
  Default,
  Description,
  Option,
  Reference,
  Variable,
}

export interface ActionReference<T extends Reference = Reference> {
  payload: T
  type: TypeAction.Reference
}

export interface ActionDescription {
  payload: string
  type: TypeAction.Description
}

export interface ActionDefault<T extends boolean = boolean> {
  payload: T
  type: TypeAction.Default
}

interface TruthTable<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  false: U
  true: T
}

export interface ActionVariable<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  payload: TruthTable<T, U>
  type: TypeAction.Variable
}

export interface ActionOption<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  payload: TruthTable<T, U>
  type: TypeAction.Option
}

export type Actions = Array<
  ActionDefault | ActionDescription | ActionOption | ActionReference | ActionVariable
>

type InterfaceDefault<T extends Model<State, Actions>> = <U extends boolean>(
  value: U,
) => Next<Settings, T, ActionDefault<U>>

type InterfaceDescription<T extends Model<State, Actions>> = (
  description: string,
) => Next<Settings, T, ActionDescription>

type InterfaceOptionOrVariableValues<
  T extends string,
  P extends string | undefined = undefined,
  Q extends string | undefined = undefined,
> =
  | [Exclude<P, T | undefined>, Exclude<Exclude<Q, T | undefined>, Exclude<P, T | undefined>>]
  | [Exclude<P, T | undefined>]
  | [undefined, Exclude<Q, T | undefined>]

type InterfaceOption<T extends Model<State, Actions>> = <
  P extends string | undefined = undefined,
  Q extends string | undefined = undefined,
>(
  ...values: InterfaceOptionOrVariableValues<$.Values<T['state']['options']>, P, Q>
) => Next<Settings, T, ActionOption<P, Q>>

type InterfaceReference<T extends Model<State, Actions>> = <U extends Reference>(
  reference: U,
) => Next<Settings, T, ActionReference<U>>

type InterfaceVariable<T extends Model<State, Actions>> = <
  P extends string | undefined = undefined,
  Q extends string | undefined = undefined,
>(
  ...values: InterfaceOptionOrVariableValues<$.Values<T['state']['variables']>, P, Q>
) => Next<Settings, T, ActionVariable<P, Q>>

interface Interface<T extends Model<State, Actions>> extends FluentInterface<T> {
  default: InterfaceDefault<T>
  description: InterfaceDescription<T>
  option: InterfaceOption<T>
  reference: InterfaceReference<T>
  variable: InterfaceVariable<T>
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_BOOLEAN_INTERFACE
  [Options.Reducer]: typeof INPUT_BOOLEAN_REDUCER
  [Options.Specification]: typeof INPUT_BOOLEAN_SPECIFICATION
  [Options.State]: State
}

export interface State extends StateShared {
  default: boolean | undefined
  reducer: GenericInputBooleanReducer<boolean | undefined>
  table: {
    options: Record<string, boolean>
    variables: Record<string, boolean>
  }
  type: typeof SYMBOL_INPUT_BOOLEAN
}

interface InitialState extends StateSharedInitial {
  default: undefined
  reducer: GenericInputBooleanReducer<boolean | undefined>
  table: {
    options: Record<string, boolean>
    variables: Record<string, boolean>
  }
  type: typeof SYMBOL_INPUT_BOOLEAN
}

interface Specification<T extends Model<State, Action[]>> {
  [TypeAction.Reference]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'reference'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Reference
  }

  [TypeAction.Description]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof TypeAction.Reference
    [Options.Enabled]: $.True
    [Options.Keys]: 'description'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Description
  }

  [TypeAction.Option]: {
    [Options.Conflicts]: typeof TypeAction.Default
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'option'
    [Options.Once]: $.False
    [Options.Type]: typeof TypeAction.Option
  }

  [TypeAction.Variable]: {
    [Options.Conflicts]: typeof TypeAction.Default
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'variable'
    [Options.Once]: $.False
    [Options.Type]: typeof TypeAction.Variable
  }

  [TypeAction.Default]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof TypeAction.Description
    // TODO: use conflict?
    [Options.Enabled]: $.Not<$.Is.Never<Extract<$.Values<T['log']>, ActionOption | ActionVariable>>>
    [Options.Keys]: 'default'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_BOOLEAN_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_BOOLEAN_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_BOOLEAN_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
  }
}

type PayloadActionDefault<T extends Action[]> = Payload<$.Values<T>, TypeAction.Default>
type PayloadActionOption<T extends Action[]> = Payload<$.Values<T>, TypeAction.Option>
type PayloadActionReference<T extends Action[]> = Payload<$.Values<T>, TypeAction.Reference>
type PayloadActionVariable<T extends Action[]> = Payload<$.Values<T>, TypeAction.Variable>

interface Reducer<T extends Action[]> {
  [TypeAction.Default]: {
    default: PayloadActionDefault<T>
    reducer: GenericInputBooleanReducer<boolean>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Option]: {
    isEmpty: false
    options: PayloadActionOption<T> extends {
      false: infer Q
      true: infer P
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
  }
  [TypeAction.Reference]: {
    reference: PayloadActionReference<T>
  }
  [TypeAction.Variable]: {
    isEmpty: false
    variables: PayloadActionVariable<T> extends {
      false: infer Q
      true: infer P
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
  }
}

type ValuesOptions<T extends string> = $.If<
  $.Is.Never<T>,
  never,
  {
    name: T
    type: InputType.Option
    value: boolean
  }
>

type ValuesVariables<T extends string> = $.If<
  $.Is.Never<$.Values<T>>,
  never,
  {
    name: $.Values<T>
    type: InputType.Variable
    value: string
  }
>

type Values<T extends Model<State, Actions>> = Array<
  | ValuesOptions<$.Values<T['state']['options']>>
  | ValuesVariables<$.Values<T['state']['variables']>>
>

export interface InputBooleanState extends State {
  isEmpty: false
}

export interface InputBoolean extends FluentInterface<Model<InputBooleanState, Actions>> {}

interface ModelInputBoolean {
  readonly log: InputBoolean[typeof SYMBOL_LOG]
  readonly state: InputBoolean[typeof SYMBOL_STATE]
}

export interface PropertiesInputBoolean extends InputPropertiesShared {
  readonly model: ModelInputBoolean
}

type GenericInputBooleanReducer<T = unknown, U = any> = (
  values: U,
  properties: PropertiesInputBoolean,
) => T

export type DefaultInputBooleanReducer = GenericInputBooleanReducer<
  any,
  Values<Model<State, Actions>>
>
