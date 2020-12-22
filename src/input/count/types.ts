import $ from '@escapace/typelevel'

import {
  Action,
  Payload,
  SYMBOL_LOG,
  SYMBOL_STATE,
  FluentInterface,
  Model,
  Next,
  Options
} from '@escapace/fluent'

import {
  SYMBOL_INPUT_COUNT,
  Reference,
  InputType,
  PropsShared,
  SharedState,
  SharedInitialState
} from '../../types'

import { GenericOption } from '../../utility/normalize'

export declare const INPUT_COUNT_INTERFACE: unique symbol
export declare const INPUT_COUNT_SPECIFICATION: unique symbol
export declare const INPUT_COUNT_REDUCER: unique symbol

export enum TypeAction {
  Default,
  Description,
  Option,
  Reference
}

export interface ActionReference<T extends Reference = Reference> {
  type: TypeAction.Reference
  payload: T
}

export interface ActionDescription {
  type: TypeAction.Description
  payload: string
}

export interface ActionDefault<T extends number = number> {
  type: TypeAction.Default
  payload: T
}

export interface FunctionTable<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined
> {
  increase: T
  decrease: U
}

export interface ActionOption<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined
> {
  type: TypeAction.Option
  payload: FunctionTable<T, U>
}

export type Actions = Array<
  ActionDefault | ActionDescription | ActionOption | ActionReference
>

export interface Interface<T extends Model<State, Actions>>
  extends FluentInterface<T> {
  reference: <U extends Reference>(
    reference: U
  ) => Next<Settings, T, ActionReference<U>>
  description: (description: string) => Next<Settings, T, ActionDescription>
  default: <U extends number>(value: U) => Next<Settings, T, ActionDefault<U>>
  option: <
    P extends string | undefined = undefined,
    Q extends string | undefined = undefined
  >(
    ...values:
      | [Exclude<P, undefined | $.Values<T['state']['options']>>]
      | [undefined, Exclude<Q, undefined | $.Values<T['state']['options']>>]
      | [
          Exclude<P, undefined | $.Values<T['state']['options']>>,
          Exclude<
            Exclude<Q, undefined | $.Values<T['state']['options']>>,
            Exclude<P, undefined | $.Values<T['state']['options']>>
          >
        ]
  ) => Next<Settings, T, ActionOption<P, Q>>
}

export interface Settings {
  [Options.Interface]: typeof INPUT_COUNT_INTERFACE
  [Options.Specification]: typeof INPUT_COUNT_SPECIFICATION
  [Options.Reducer]: typeof INPUT_COUNT_REDUCER
  [Options.InitialState]: InitialState
  [Options.State]: State
}

export interface State extends SharedState {
  type: typeof SYMBOL_INPUT_COUNT
  default: number
  reducer: GenericInputCountReducer<number>
  table: Record<string, number>
}

export interface InitialState extends SharedInitialState {
  type: typeof SYMBOL_INPUT_COUNT
  default: 0
  reducer: GenericInputCountReducer<number>
  table: Record<string, number>
}

export interface Specification<_ extends Model<State>> {
  [TypeAction.Reference]: {
    [Options.Type]: typeof TypeAction.Reference
    [Options.Once]: $.True
    [Options.Dependencies]: never
    [Options.Keys]: 'reference'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [TypeAction.Description]: {
    [Options.Type]: typeof TypeAction.Description
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.Reference
    [Options.Keys]: 'description'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [TypeAction.Option]: {
    [Options.Type]: typeof TypeAction.Option
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'option'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Default
  }

  [TypeAction.Default]: {
    [Options.Type]: typeof TypeAction.Default
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.Option
    [Options.Keys]: 'default'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_COUNT_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_COUNT_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [INPUT_COUNT_REDUCER]: Reducer<$.Cast<A, Action[]>>
  }
}

export interface Reducer<T extends Action[]> {
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Default]: {
    default: Payload<$.Values<T>, TypeAction.Default>
  }
  [TypeAction.Option]: {
    options: Payload<$.Values<T>, TypeAction.Option> extends {
      increase: infer P
      decrease: infer Q
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
    isEmpty: false
  }
}

export interface InputCountState extends State {
  isEmpty: false
}

export interface InputCount
  extends FluentInterface<Model<InputCountState, Actions>> {}

export type Values<T extends Model<State, Actions>> = Array<
  $.If<
    $.Is.Never<$.Values<T['state']['options']>>,
    never,
    {
      type: InputType.Option
      name: $.Values<T['state']['options']>
      value: number
    }
  >
>

export interface ModelInputCount {
  readonly state: InputCount[typeof SYMBOL_STATE]
  readonly log: InputCount[typeof SYMBOL_LOG]
}

export interface PropsInputCount extends PropsShared {
  readonly model: ModelInputCount
}

export type GenericInputCountReducer<T = unknown, U = any> = (
  values: U,
  props: PropsInputCount
) => T

export type DefaultInputCountReducer = GenericInputCountReducer<
  number,
  Array<GenericOption<number>>
>
