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
  GenericConfiguration,
  GenericOption,
  PropertiesInputShared,
  Reference,
  SharedInitialState,
  SharedState,
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

export interface FunctionTable<
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

export interface Interface<T extends Model<State, Actions>> extends FluentInterface<T> {
  default: <U extends number>(value: U) => Next<Settings, T, ActionDefault<U>>
  description: (description: string) => Next<Settings, T, ActionDescription>
  option: <P extends string | undefined = undefined, Q extends string | undefined = undefined>(
    ...values:
      | [
          Exclude<P, $.Values<T['state']['options']> | undefined>,
          Exclude<
            Exclude<Q, $.Values<T['state']['options']> | undefined>,
            Exclude<P, $.Values<T['state']['options']> | undefined>
          >,
        ]
      | [Exclude<P, $.Values<T['state']['options']> | undefined>]
      | [undefined, Exclude<Q, $.Values<T['state']['options']> | undefined>]
  ) => Next<Settings, T, ActionOption<P, Q>>
  reference: <U extends Reference>(reference: U) => Next<Settings, T, ActionReference<U>>
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_COUNT_INTERFACE
  [Options.Reducer]: typeof INPUT_COUNT_REDUCER
  [Options.Specification]: typeof INPUT_COUNT_SPECIFICATION
  [Options.State]: State
}

export interface State extends SharedState {
  default: number
  reducer: GenericInputCountReducer<number>
  table: Record<string, number>
  type: typeof SYMBOL_INPUT_COUNT
}

export interface InitialState extends SharedInitialState {
  default: 0
  reducer: GenericInputCountReducer<number>
  table: Record<string, number>
  type: typeof SYMBOL_INPUT_COUNT
}

export interface Specification<_ extends Model<State>> {
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
    [INPUT_COUNT_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_COUNT_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_COUNT_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
  }
}

export interface Reducer<T extends Action[]> {
  [TypeAction.Default]: {
    default: Payload<$.Values<T>, TypeAction.Default>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Option]: {
    isEmpty: false
    options: Payload<$.Values<T>, TypeAction.Option> extends {
      decrease: infer Q
      increase: infer P
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
  }
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
}

export interface InputCountState extends State {
  isEmpty: false
}

export interface InputCount extends FluentInterface<Model<InputCountState, Actions>> {}

// type Values<T extends Model<State, Actions>> = Array<
//   $.If<
//     $.Is.Never<$.Values<T['state']['options']>>,
//     never,
//     {
//       name: $.Values<T['state']['options']>
//       type: InputType.Option
//       value: number
//     }
//   >
// >

export interface ModelInputCount {
  readonly log: InputCount[typeof SYMBOL_LOG]
  readonly state: InputCount[typeof SYMBOL_STATE]
}

export interface PropertiesInputCount extends PropertiesInputShared {
  readonly model: ModelInputCount
}

export type GenericInputCountReducer<T = unknown, U = any> = (
  values: U,
  properties: PropertiesInputCount,
) => T

export type DefaultInputCountReducer = GenericInputCountReducer<
  number,
  Array<GenericConfiguration<any> | GenericOption<number>>
>
