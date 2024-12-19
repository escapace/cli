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
import type $ from '@escapace/typelevel'
import type {
  GenericOption,
  InputPropertiesShared,
  Reference,
  StateShared,
  StateSharedInitial,
  SYMBOL_INPUT_COUNT,
} from '../../types'

export declare const INPUT_COUNT_INTERFACE: unique symbol
export declare const INPUT_COUNT_SPECIFICATION: unique symbol
export declare const INPUT_COUNT_REDUCER: unique symbol

export enum InputCountTypeAction {
  Default,
  Description,
  Option,
  Reference,
}

export interface InputCountActionReference<T extends Reference = Reference> {
  payload: T
  type: InputCountTypeAction.Reference
}

export interface InputCountActionDescription {
  payload: string
  type: InputCountTypeAction.Description
}

export interface InputCountActionDefault<T extends number = number> {
  payload: T
  type: InputCountTypeAction.Default
}

interface FunctionTable<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  decrease: U
  increase: T
}

export interface InputCountActionOption<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  payload: FunctionTable<T, U>
  type: InputCountTypeAction.Option
}

export type InputCountActions = Array<
  | InputCountActionDefault
  | InputCountActionDescription
  | InputCountActionOption
  | InputCountActionReference
>

type InterfaceDefault<T extends Model<InputCountState, InputCountActions>> = <U extends number>(
  value: U,
) => Next<InputCountSettings, T, InputCountActionDefault<U>>

type InterfaceDescription<T extends Model<InputCountState, InputCountActions>> = (
  description: string,
) => Next<InputCountSettings, T, InputCountActionDescription>

type InterfaceOptionValue<
  T extends string,
  P extends string | undefined,
  Q extends string | undefined,
> =
  | [Exclude<P, T | undefined>, Exclude<Exclude<Q, T | undefined>, Exclude<P, T | undefined>>]
  | [Exclude<P, T | undefined>]
  | [undefined, Exclude<Q, T | undefined>]

type InterfaceOption<T extends Model<InputCountState, InputCountActions>> = <
  P extends string | undefined = undefined,
  Q extends string | undefined = undefined,
>(
  ...values: InterfaceOptionValue<$.Values<T['state']['options']>, P, Q>
) => Next<InputCountSettings, T, InputCountActionOption<P, Q>>

type InterfaceReference<T extends Model<InputCountState, InputCountActions>> = <
  U extends Reference,
>(
  reference: U,
) => Next<InputCountSettings, T, InputCountActionReference<U>>

interface Interface<T extends Model<InputCountState, InputCountActions>>
  extends FluentInterface<T> {
  default: InterfaceDefault<T>
  description: InterfaceDescription<T>
  option: InterfaceOption<T>
  reference: InterfaceReference<T>
}

export interface InputCountSettings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_COUNT_INTERFACE
  [Options.Reducer]: typeof INPUT_COUNT_REDUCER
  [Options.Specification]: typeof INPUT_COUNT_SPECIFICATION
  [Options.State]: InputCountState
}

export interface InputCountState extends StateShared {
  default: number
  reducer: InputCountReducerGeneric<number>
  table: Record<string, number>
  type: typeof SYMBOL_INPUT_COUNT
}

interface InitialState extends StateSharedInitial {
  default: 0
  reducer: InputCountReducerGeneric<number>
  table: Record<string, number>
  type: typeof SYMBOL_INPUT_COUNT
}

interface Specification<_ extends Model<InputCountState>> {
  [InputCountTypeAction.Reference]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'reference'
    [Options.Once]: $.True
    [Options.Type]: typeof InputCountTypeAction.Reference
  }

  [InputCountTypeAction.Description]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputCountTypeAction.Reference
    [Options.Enabled]: $.True
    [Options.Keys]: 'description'
    [Options.Once]: $.True
    [Options.Type]: typeof InputCountTypeAction.Description
  }

  [InputCountTypeAction.Option]: {
    [Options.Conflicts]: typeof InputCountTypeAction.Default
    [Options.Dependencies]: typeof InputCountTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'option'
    [Options.Once]: $.False
    [Options.Type]: typeof InputCountTypeAction.Option
  }

  [InputCountTypeAction.Default]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputCountTypeAction.Option
    [Options.Enabled]: $.True
    [Options.Keys]: 'default'
    [Options.Once]: $.True
    [Options.Type]: typeof InputCountTypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_COUNT_INTERFACE]: Interface<$.Cast<A, Model<InputCountState, Action[]>>>
    [INPUT_COUNT_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_COUNT_SPECIFICATION]: Specification<$.Cast<A, Model<InputCountState, Action[]>>>
  }
}

type PayloadActionDefault<T extends Action[]> = Payload<$.Values<T>, InputCountTypeAction.Default>
type PayloadActionOption<T extends Action[]> = Payload<$.Values<T>, InputCountTypeAction.Option>
type PayloadActionReference<T extends Action[]> = Payload<
  $.Values<T>,
  InputCountTypeAction.Reference
>

interface Reducer<T extends Action[]> {
  [InputCountTypeAction.Default]: {
    default: PayloadActionDefault<T>
  }
  [InputCountTypeAction.Description]: {
    description: string
  }
  [InputCountTypeAction.Option]: {
    isEmpty: false
    options: PayloadActionOption<T> extends {
      decrease: infer Q
      increase: infer P
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
  }
  [InputCountTypeAction.Reference]: {
    reference: PayloadActionReference<T>
  }
}

export interface InputCountStateInitial extends InputCountState {
  isEmpty: false
}

export interface InputCount
  extends FluentInterface<Model<InputCountStateInitial, InputCountActions>> {}

interface InputCountModel {
  readonly log: InputCount[typeof SYMBOL_LOG]
  readonly state: InputCount[typeof SYMBOL_STATE]
}

interface InputCountProperties extends InputPropertiesShared {
  readonly model: InputCountModel
}

type InputCountReducerGeneric<T = unknown, U = any> = (
  values: U,
  properties: InputCountProperties,
) => T

export type InputCountReducerDefault = InputCountReducerGeneric<
  number,
  Array<GenericOption<number>>
>
