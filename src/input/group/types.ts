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

export enum InputGroupTypeAction {
  Description,
  Input,
  Reducer,
  Reference,
}

export interface InputGroupActionReference<T extends Reference = Reference> {
  payload: T
  type: InputGroupTypeAction.Reference
}

export interface InputGroupActionDescription {
  payload: string
  type: InputGroupTypeAction.Description
}

export interface InputGroupActionReducer<T = unknown> {
  payload: InputGroupReducerGeneric<T>
  type: InputGroupTypeAction.Reducer
}

export interface InputGroupActionInput<T extends Input = Input> {
  payload: T
  type: InputGroupTypeAction.Input
}

export type InputGroupActions = Array<
  | InputGroupActionDescription
  | InputGroupActionInput
  | InputGroupActionReducer
  | InputGroupActionReference
>

type InterfaceDescription<T extends Model<InputGroupState, InputGroupActions>> = (
  description: string,
) => Next<InputGroupSettings, T, InputGroupActionDescription>

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

type InterfaceInput<T extends Model<InputGroupState, InputGroupActions>> = <
  U extends Input,
  A extends Input[typeof SYMBOL_STATE] = CastActionPayloadInputState<T['log']>,
  B extends Input[typeof SYMBOL_STATE] = U[typeof SYMBOL_STATE],
>(
  input: U,
) => $.If<
  InterfaceInputValues<T['state']['reference'], A, B>,
  unknown,
  Next<InputGroupSettings, T, InputGroupActionInput<U>>
>

type InterfaceReducer<T extends Model<InputGroupState, InputGroupActions>> = <U>(
  reducer: InputGroupReducer<U, T>,
) => Next<InputGroupSettings, T, InputGroupActionReducer<U>>

type InterfaceReference<T extends Model<InputGroupState, InputGroupActions>> = <
  U extends Reference,
>(
  reference: U,
) => Next<InputGroupSettings, T, InputGroupActionReference<U>>

interface Interface<T extends Model<InputGroupState, InputGroupActions>>
  extends FluentInterface<T> {
  description: InterfaceDescription<T>
  input: InterfaceInput<T>
  reducer: InterfaceReducer<T>
  reference: InterfaceReference<T>
}

export interface InputGroupSettings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_GROUP_INTERFACE
  [Options.Reducer]: typeof INPUT_GROUP_REDUCER
  [Options.Specification]: typeof INPUT_GROUP_SPECIFICATION
  [Options.State]: InputGroupState
}

export interface InputGroupState extends StateShared {
  inputs: Input[]
  reducer: InputGroupReducerGeneric
  type: typeof SYMBOL_INPUT_GROUP
}

interface InitialState extends StateSharedInitial {
  inputs: []
  reducer: InputGroupReducerGeneric
  type: typeof SYMBOL_INPUT_GROUP
}

interface Specification<_ extends Model<InputGroupState>> {
  [InputGroupTypeAction.Reference]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'reference'
    [Options.Once]: $.True
    [Options.Type]: typeof InputGroupTypeAction.Reference
  }

  [InputGroupTypeAction.Description]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputGroupTypeAction.Reference
    [Options.Enabled]: $.True
    [Options.Keys]: 'description'
    [Options.Once]: $.True
    [Options.Type]: typeof InputGroupTypeAction.Description
  }

  [InputGroupTypeAction.Input]: {
    [Options.Conflicts]: typeof InputGroupTypeAction.Reducer
    [Options.Dependencies]: typeof InputGroupTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'input'
    [Options.Once]: $.False
    [Options.Type]: typeof InputGroupTypeAction.Input
  }

  [InputGroupTypeAction.Reducer]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputGroupTypeAction.Input
    [Options.Enabled]: $.True
    [Options.Keys]: 'reducer'
    [Options.Once]: $.True
    [Options.Type]: typeof InputGroupTypeAction.Reducer
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_GROUP_INTERFACE]: Interface<$.Cast<A, Model<InputGroupState>>>
    [INPUT_GROUP_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_GROUP_SPECIFICATION]: Specification<$.Cast<A, Model<InputGroupState>>>
  }
}

type ActionPayloadInput<T extends Action[]> = Payload<$.Values<T>, InputGroupTypeAction.Input>
type ActionPayloadReducer<T extends Action[]> = Payload<$.Values<T>, InputGroupTypeAction.Reducer>
type ActionPayloadReference<T extends Action[]> = Payload<
  $.Values<T>,
  InputGroupTypeAction.Reference
>
type CastActionPayloadInputState<T extends Action[]> = $.Cast<
  ActionPayloadInput<T>,
  Input
>[typeof SYMBOL_STATE]

interface Reducer<T extends Action[]> {
  [InputGroupTypeAction.Description]: {
    description: string
  }
  [InputGroupTypeAction.Input]: {
    inputs: Array<$.Cast<ActionPayloadInput<T>, Input>>
    isEmpty: false
    options: Array<
      CastActionPayloadInputState<T> extends {
        options: Array<infer X>
      }
        ? X
        : never
    >
    reducer: InputGroupReducerGeneric<Values<T>>
    variables: Array<
      CastActionPayloadInputState<T> extends {
        variables: Array<infer X>
      }
        ? X
        : never
    >
  }
  [InputGroupTypeAction.Reducer]: {
    reducer: ActionPayloadReducer<T>
  }
  [InputGroupTypeAction.Reference]: {
    reference: ActionPayloadReference<T>
  }
}

export interface InputGroupStateInitial extends InputGroupState {
  isEmpty: false
}

export interface InputGroup
  extends FluentInterface<Model<InputGroupStateInitial, InputGroupActions>> {}

type Values<T extends InputGroupActions, U = CastActionPayloadInputState<T>> = $.Cast<
  UnionMerge<
    U extends { reducer: infer Y; reference: infer X }
      ? Record<$.Cast<X, Reference>, Unwrap<Y>>
      : never
  >,
  object
>

interface InputGroupModel {
  readonly log: InputGroup[typeof SYMBOL_LOG]
  readonly state: InputGroup[typeof SYMBOL_STATE]
}

export interface InputGroupProperties extends InputPropertiesShared {
  readonly model: InputGroupModel
}

export type InputGroupReducerGeneric<T = unknown, U = any> = (
  values: U,
  properties: InputGroupProperties,
) => T

type InputGroupReducer<
  T = unknown,
  U extends Model<InputGroupState, InputGroupActions> = Model<InputGroupState, InputGroupActions>,
> = (
  values: SimplifyDeep<Values<U['log']>>,
  properties: { model: { log: U['log']; state: U['state'] } } & InputPropertiesShared,
) => Promise<T> | T

export interface InputGroupEmpty
  extends FluentInterface<Model<InputGroupState, InputGroupActions>> {}

export type InputGroupValuesLookup<T extends InputGroupEmpty> = Values<LookupModel<T>['log']>
