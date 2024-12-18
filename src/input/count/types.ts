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
  StateSharedInitial,
  StateShared,
  SYMBOL_INPUT_COUNT,
} from '../../types'

export declare const INPUT_COUNT_INTERFACE: unique symbol
export declare const INPUT_COUNT_SPECIFICATION: unique symbol
export declare const INPUT_COUNT_REDUCER: unique symbol

export enum TypeAction {
  Default,
  Description,
  Option,
  Reference,
}

export interface ActionReference<T extends Reference = Reference> {
  payload: T
  type: TypeAction.Reference
}

export interface ActionDescription {
  payload: string
  type: TypeAction.Description
}

export interface ActionDefault<T extends number = number> {
  payload: T
  type: TypeAction.Default
}

interface FunctionTable<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  decrease: U
  increase: T
}

export interface ActionOption<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined,
> {
  payload: FunctionTable<T, U>
  type: TypeAction.Option
}

export type Actions = Array<ActionDefault | ActionDescription | ActionOption | ActionReference>

type InterfaceDefault<T extends Model<State, Actions>> = <U extends number>(
  value: U,
) => Next<Settings, T, ActionDefault<U>>

type InterfaceDescription<T extends Model<State, Actions>> = (
  description: string,
) => Next<Settings, T, ActionDescription>

type InterfaceOptionValue<
  T extends string,
  P extends string | undefined,
  Q extends string | undefined,
> =
  | [Exclude<P, T | undefined>, Exclude<Exclude<Q, T | undefined>, Exclude<P, T | undefined>>]
  | [Exclude<P, T | undefined>]
  | [undefined, Exclude<Q, T | undefined>]

type InterfaceOption<T extends Model<State, Actions>> = <
  P extends string | undefined = undefined,
  Q extends string | undefined = undefined,
>(
  ...values: InterfaceOptionValue<$.Values<T['state']['options']>, P, Q>
) => Next<Settings, T, ActionOption<P, Q>>

type InterfaceReference<T extends Model<State, Actions>> = <U extends Reference>(
  reference: U,
) => Next<Settings, T, ActionReference<U>>

interface Interface<T extends Model<State, Actions>> extends FluentInterface<T> {
  default: InterfaceDefault<T>
  description: InterfaceDescription<T>
  option: InterfaceOption<T>
  reference: InterfaceReference<T>
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_COUNT_INTERFACE
  [Options.Reducer]: typeof INPUT_COUNT_REDUCER
  [Options.Specification]: typeof INPUT_COUNT_SPECIFICATION
  [Options.State]: State
}

export interface State extends StateShared {
  default: number
  reducer: GenericInputCountReducer<number>
  table: Record<string, number>
  type: typeof SYMBOL_INPUT_COUNT
}

interface InitialState extends StateSharedInitial {
  default: 0
  reducer: GenericInputCountReducer<number>
  table: Record<string, number>
  type: typeof SYMBOL_INPUT_COUNT
}

interface Specification<_ extends Model<State>> {
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

  [TypeAction.Default]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof TypeAction.Option
    [Options.Enabled]: $.True
    [Options.Keys]: 'default'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_COUNT_INTERFACE]: Interface<$.Cast<A, Model<State, Action[]>>>
    [INPUT_COUNT_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_COUNT_SPECIFICATION]: Specification<$.Cast<A, Model<State, Action[]>>>
  }
}

type PayloadActionDefault<T extends Action[]> = Payload<$.Values<T>, TypeAction.Default>
type PayloadActionOption<T extends Action[]> = Payload<$.Values<T>, TypeAction.Option>
type PayloadActionReference<T extends Action[]> = Payload<$.Values<T>, TypeAction.Reference>

interface Reducer<T extends Action[]> {
  [TypeAction.Default]: {
    default: PayloadActionDefault<T>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Option]: {
    isEmpty: false
    options: PayloadActionOption<T> extends {
      decrease: infer Q
      increase: infer P
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
  }
  [TypeAction.Reference]: {
    reference: PayloadActionReference<T>
  }
}

export interface InputCountState extends State {
  isEmpty: false
}

export interface InputCount extends FluentInterface<Model<InputCountState, Actions>> {}

interface ModelInputCount {
  readonly log: InputCount[typeof SYMBOL_LOG]
  readonly state: InputCount[typeof SYMBOL_STATE]
}

export interface PropertiesInputCount extends InputPropertiesShared {
  readonly model: ModelInputCount
}

type GenericInputCountReducer<T = unknown, U = any> = (
  values: U,
  properties: PropertiesInputCount,
) => T

export type DefaultInputCountReducer = GenericInputCountReducer<
  number,
  Array<GenericOption<number>>
>
