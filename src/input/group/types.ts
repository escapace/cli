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
  Input,
  LookupModel,
  InputPropertiesShared,
  Reference,
  StateSharedInitial,
  StateShared,
  SYMBOL_INPUT_GROUP,
  UnionMerge,
  Unwrap,
} from '../../types'
import type { SimplifyDeep } from 'type-fest'

export declare const INPUT_GROUP_INTERFACE: unique symbol
export declare const INPUT_GROUP_SPECIFICATION: unique symbol
export declare const INPUT_GROUP_REDUCER: unique symbol

export enum TypeAction {
  Description,
  Input,
  Reducer,
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

export interface ActionReducer<T = unknown> {
  payload: GenericInputGroupReducer<T>
  type: TypeAction.Reducer
}

export interface ActionInput<T extends Input = Input> {
  payload: T
  type: TypeAction.Input
}

export type Actions = Array<ActionDescription | ActionInput | ActionReducer | ActionReference>

type InterfaceDescription<T extends Model<State, Actions>> = (
  description: string,
) => Next<Settings, T, ActionDescription>

type InterfaceInputValues<
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

type InterfaceInput<T extends Model<State, Actions>> = <
  U extends Input,
  A extends Input[typeof SYMBOL_STATE] = CastActionPayloadInputState<T['log']>,
  B extends Input[typeof SYMBOL_STATE] = U[typeof SYMBOL_STATE],
>(
  input: U,
) => $.If<
  InterfaceInputValues<T['state']['reference'], A, B>,
  unknown,
  Next<Settings, T, ActionInput<U>>
>

type InterfaceReducer<T extends Model<State, Actions>> = <U>(
  reducer: InputGroupReducer<U, T>,
) => Next<Settings, T, ActionReducer<U>>

type InterfaceReference<T extends Model<State, Actions>> = <U extends Reference>(
  reference: U,
) => Next<Settings, T, ActionReference<U>>

interface Interface<T extends Model<State, Actions>> extends FluentInterface<T> {
  description: InterfaceDescription<T>
  input: InterfaceInput<T>
  reducer: InterfaceReducer<T>
  reference: InterfaceReference<T>
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_GROUP_INTERFACE
  [Options.Reducer]: typeof INPUT_GROUP_REDUCER
  [Options.Specification]: typeof INPUT_GROUP_SPECIFICATION
  [Options.State]: State
}

export interface State extends StateShared {
  inputs: Input[]
  reducer: GenericInputGroupReducer
  type: typeof SYMBOL_INPUT_GROUP
}

interface InitialState extends StateSharedInitial {
  inputs: []
  reducer: GenericInputGroupReducer
  type: typeof SYMBOL_INPUT_GROUP
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

  [TypeAction.Input]: {
    [Options.Conflicts]: typeof TypeAction.Reducer
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'input'
    [Options.Once]: $.False
    [Options.Type]: typeof TypeAction.Input
  }

  [TypeAction.Reducer]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof TypeAction.Input
    [Options.Enabled]: $.True
    [Options.Keys]: 'reducer'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Reducer
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_GROUP_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_GROUP_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_GROUP_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
  }
}

type ActionPayloadInput<T extends Action[]> = Payload<$.Values<T>, TypeAction.Input>
type ActionPayloadReducer<T extends Action[]> = Payload<$.Values<T>, TypeAction.Reducer>
type ActionPayloadReference<T extends Action[]> = Payload<$.Values<T>, TypeAction.Reference>
type CastActionPayloadInputState<T extends Action[]> = $.Cast<
  ActionPayloadInput<T>,
  Input
>[typeof SYMBOL_STATE]

interface Reducer<T extends Action[]> {
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Input]: {
    inputs: Array<$.Cast<ActionPayloadInput<T>, Input>>
    isEmpty: false
    options: Array<
      CastActionPayloadInputState<T> extends {
        options: Array<infer X>
      }
        ? X
        : never
    >
    reducer: GenericInputGroupReducer<Values<T>>
    variables: Array<
      CastActionPayloadInputState<T> extends {
        variables: Array<infer X>
      }
        ? X
        : never
    >
  }
  [TypeAction.Reducer]: {
    reducer: ActionPayloadReducer<T>
  }
  [TypeAction.Reference]: {
    reference: ActionPayloadReference<T>
  }
}

export interface InputGroupState extends State {
  isEmpty: false
}

export interface InputGroup extends FluentInterface<Model<InputGroupState, Actions>> {}

type Values<T extends Actions, U = CastActionPayloadInputState<T>> = $.Cast<
  UnionMerge<
    U extends { reducer: infer Y; reference: infer X }
      ? Record<$.Cast<X, Reference>, Unwrap<Y>>
      : never
  >,
  object
>

interface ModelInputGroup {
  readonly log: InputGroup[typeof SYMBOL_LOG]
  readonly state: InputGroup[typeof SYMBOL_STATE]
}

export interface PropertiesInputGroup extends InputPropertiesShared {
  readonly model: ModelInputGroup
}

export type GenericInputGroupReducer<T = unknown, U = any> = (
  values: U,
  properties: PropertiesInputGroup,
) => T

type InputGroupReducer<T = unknown, U extends Model<State, Actions> = Model<State, Actions>> = (
  values: SimplifyDeep<Values<U['log']>>,
  properties: { model: { log: U['log']; state: U['state'] } } & InputPropertiesShared,
) => Promise<T> | T

export interface InputGroupEmpty extends FluentInterface<Model<State, Actions>> {}

export type LookupValues<T extends InputGroupEmpty> = Values<LookupModel<T>['log']>
