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

export enum InputBooleanTypeAction {
  Default,
  Description,
  Option,
  Reference,
  Variable,
}

export interface InputBooleanActionReference<T extends Reference = Reference> {
  payload: T
  type: InputBooleanTypeAction.Reference
}

export interface InputBooleanActionDescription {
  payload: string
  type: InputBooleanTypeAction.Description
}

export interface InputBooleanActionDefault<T extends boolean = boolean> {
  payload: T
  type: InputBooleanTypeAction.Default
}

interface TruthTable<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  false: U
  true: T
}

export interface InputBooleanActionVariable<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  payload: TruthTable<T, U>
  type: InputBooleanTypeAction.Variable
}

export interface InputBooleanActionOption<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  payload: TruthTable<T, U>
  type: InputBooleanTypeAction.Option
}

export type InputBooleanActions = Array<
  | InputBooleanActionDefault
  | InputBooleanActionDescription
  | InputBooleanActionOption
  | InputBooleanActionReference
  | InputBooleanActionVariable
>

type InterfaceDefault<T extends Model<InputBooleanState, InputBooleanActions>> = <
  U extends boolean,
>(
  value: U,
) => Next<InputBooleanSettings, T, InputBooleanActionDefault<U>>

type InterfaceDescription<T extends Model<InputBooleanState, InputBooleanActions>> = (
  description: string,
) => Next<InputBooleanSettings, T, InputBooleanActionDescription>

type InterfaceOptionOrVariableValues<
  T extends string,
  P extends string | undefined = undefined,
  Q extends string | undefined = undefined,
> =
  | [Exclude<P, T | undefined>, Exclude<Exclude<Q, T | undefined>, Exclude<P, T | undefined>>]
  | [Exclude<P, T | undefined>]
  | [undefined, Exclude<Q, T | undefined>]

type InterfaceOption<T extends Model<InputBooleanState, InputBooleanActions>> = <
  P extends string | undefined = undefined,
  Q extends string | undefined = undefined,
>(
  ...values: InterfaceOptionOrVariableValues<$.Values<T['state']['options']>, P, Q>
) => Next<InputBooleanSettings, T, InputBooleanActionOption<P, Q>>

type InterfaceReference<T extends Model<InputBooleanState, InputBooleanActions>> = <
  U extends Reference,
>(
  reference: U,
) => Next<InputBooleanSettings, T, InputBooleanActionReference<U>>

type InterfaceVariable<T extends Model<InputBooleanState, InputBooleanActions>> = <
  P extends string | undefined = undefined,
  Q extends string | undefined = undefined,
>(
  ...values: InterfaceOptionOrVariableValues<$.Values<T['state']['variables']>, P, Q>
) => Next<InputBooleanSettings, T, InputBooleanActionVariable<P, Q>>

interface Interface<T extends Model<InputBooleanState, InputBooleanActions>>
  extends FluentInterface<T> {
  default: InterfaceDefault<T>
  description: InterfaceDescription<T>
  option: InterfaceOption<T>
  reference: InterfaceReference<T>
  variable: InterfaceVariable<T>
}

export interface InputBooleanSettings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_BOOLEAN_INTERFACE
  [Options.Reducer]: typeof INPUT_BOOLEAN_REDUCER
  [Options.Specification]: typeof INPUT_BOOLEAN_SPECIFICATION
  [Options.State]: InputBooleanState
}

export interface InputBooleanState extends StateShared {
  default: boolean | undefined
  reducer: InputBooleanReducerGeneric<boolean | undefined>
  table: {
    options: Record<string, boolean>
    variables: Record<string, boolean>
  }
  type: typeof SYMBOL_INPUT_BOOLEAN
}

interface InitialState extends StateSharedInitial {
  default: undefined
  reducer: InputBooleanReducerGeneric<boolean | undefined>
  table: {
    options: Record<string, boolean>
    variables: Record<string, boolean>
  }
  type: typeof SYMBOL_INPUT_BOOLEAN
}

interface Specification<T extends Model<InputBooleanState, Action[]>> {
  [InputBooleanTypeAction.Reference]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'reference'
    [Options.Once]: $.True
    [Options.Type]: typeof InputBooleanTypeAction.Reference
  }

  [InputBooleanTypeAction.Description]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputBooleanTypeAction.Reference
    [Options.Enabled]: $.True
    [Options.Keys]: 'description'
    [Options.Once]: $.True
    [Options.Type]: typeof InputBooleanTypeAction.Description
  }

  [InputBooleanTypeAction.Option]: {
    [Options.Conflicts]: typeof InputBooleanTypeAction.Default
    [Options.Dependencies]: typeof InputBooleanTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'option'
    [Options.Once]: $.False
    [Options.Type]: typeof InputBooleanTypeAction.Option
  }

  [InputBooleanTypeAction.Variable]: {
    [Options.Conflicts]: typeof InputBooleanTypeAction.Default
    [Options.Dependencies]: typeof InputBooleanTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'variable'
    [Options.Once]: $.False
    [Options.Type]: typeof InputBooleanTypeAction.Variable
  }

  [InputBooleanTypeAction.Default]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputBooleanTypeAction.Description
    // TODO: use conflict?
    [Options.Enabled]: $.Not<
      $.Is.Never<Extract<$.Values<T['log']>, InputBooleanActionOption | InputBooleanActionVariable>>
    >
    [Options.Keys]: 'default'
    [Options.Once]: $.True
    [Options.Type]: typeof InputBooleanTypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_BOOLEAN_INTERFACE]: Interface<$.Cast<A, Model<InputBooleanState>>>
    [INPUT_BOOLEAN_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_BOOLEAN_SPECIFICATION]: Specification<$.Cast<A, Model<InputBooleanState>>>
  }
}

type PayloadActionDefault<T extends Action[]> = Payload<$.Values<T>, InputBooleanTypeAction.Default>
type PayloadActionOption<T extends Action[]> = Payload<$.Values<T>, InputBooleanTypeAction.Option>
type PayloadActionReference<T extends Action[]> = Payload<
  $.Values<T>,
  InputBooleanTypeAction.Reference
>
type PayloadActionVariable<T extends Action[]> = Payload<
  $.Values<T>,
  InputBooleanTypeAction.Variable
>

interface Reducer<T extends Action[]> {
  [InputBooleanTypeAction.Default]: {
    default: PayloadActionDefault<T>
    reducer: InputBooleanReducerGeneric<boolean>
  }
  [InputBooleanTypeAction.Description]: {
    description: string
  }
  [InputBooleanTypeAction.Option]: {
    isEmpty: false
    options: PayloadActionOption<T> extends {
      false: infer Q
      true: infer P
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
  }
  [InputBooleanTypeAction.Reference]: {
    reference: PayloadActionReference<T>
  }
  [InputBooleanTypeAction.Variable]: {
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

type Values<T extends Model<InputBooleanState, InputBooleanActions>> = Array<
  | ValuesOptions<$.Values<T['state']['options']>>
  | ValuesVariables<$.Values<T['state']['variables']>>
>

export interface InputBooleanStateInitial extends InputBooleanState {
  isEmpty: false
}

export interface InputBoolean
  extends FluentInterface<Model<InputBooleanStateInitial, InputBooleanActions>> {}

interface ModelInputBoolean {
  readonly log: InputBoolean[typeof SYMBOL_LOG]
  readonly state: InputBoolean[typeof SYMBOL_STATE]
}

export interface InputBooleanProperties extends InputPropertiesShared {
  readonly model: ModelInputBoolean
}

type InputBooleanReducerGeneric<T = unknown, U = any> = (
  values: U,
  properties: InputBooleanProperties,
) => T

export type InputBooleanReducerDefault = InputBooleanReducerGeneric<
  any,
  Values<Model<InputBooleanState, InputBooleanActions>>
>
