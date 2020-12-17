import $ from '@escapace/typelevel'

import {
  Action,
  FluentInterface,
  Model,
  Next,
  Options,
  Payload,
  SYMBOL_STATE
} from '@escapace/fluent'

import {
  Input,
  Reference,
  SYMBOL_INPUT_GROUP,
  SharedInitialState,
  SharedState,
  UnionToIntersection,
  Unwrap
} from '../../types'

export declare const INPUT_GROUP_INTERFACE: unique symbol
export declare const INPUT_GROUP_SPECIFICATION: unique symbol
export declare const INPUT_GROUP_REDUCER: unique symbol

export enum TypeAction {
  Description,
  Input,
  Reducer,
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

export interface ActionReducer<T = unknown> {
  type: TypeAction.Reducer
  payload: GenericInputGroupReducer<T>
}

export interface ActionInput<T extends Input = Input> {
  type: TypeAction.Input
  payload: T
}

export type Actions = Array<
  ActionDescription | ActionReducer | ActionInput | ActionReference
>

export interface Interface<T extends Model<State, Actions>>
  extends FluentInterface<T> {
  reference: <U extends Reference>(
    reference: U
  ) => Next<Settings, T, ActionReference<U>>
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
  reducer: <U>(
    reducer: InputGroupReducer<U, T>
  ) => Next<Settings, T, ActionReducer<U>>
}

export interface Settings {
  [Options.Interface]: typeof INPUT_GROUP_INTERFACE
  [Options.Specification]: typeof INPUT_GROUP_SPECIFICATION
  [Options.Reducer]: typeof INPUT_GROUP_REDUCER
  [Options.InitialState]: InitialState
  [Options.State]: State
}

export interface State extends SharedState {
  type: typeof SYMBOL_INPUT_GROUP
  inputs: Input[]
  reducer: GenericInputGroupReducer
}

export interface InitialState extends SharedInitialState {
  type: typeof SYMBOL_INPUT_GROUP
  inputs: []
  reducer: GenericInputGroupReducer
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

  [TypeAction.Input]: {
    [Options.Type]: typeof TypeAction.Input
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'input'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Reducer
  }

  [TypeAction.Reducer]: {
    [Options.Type]: typeof TypeAction.Reducer
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.Input
    [Options.Enabled]: $.True
    [Options.Keys]: 'reducer'
    [Options.Conflicts]: never
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_GROUP_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_GROUP_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [INPUT_GROUP_REDUCER]: Reducer<$.Cast<A, Action[]>>
  }
}

export interface Reducer<T extends Action[]> {
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Input]: {
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
    isEmpty: false
    reducer: GenericInputGroupReducer<Values<T>>
  }
  [TypeAction.Reducer]: {
    reducer: Payload<$.Values<T>, TypeAction.Reducer>
  }
}

export interface InputGroupState extends State {
  isEmpty: false
}

export interface InputGroup
  extends FluentInterface<Model<InputGroupState, Actions>> {}

type Values<
  T extends Actions,
  U = $.Cast<Payload<$.Values<T>, TypeAction.Input>, Input>[typeof SYMBOL_STATE]
> = $.Cast<
  UnionToIntersection<
    U extends { reference: infer X; reducer: infer Y }
      ? Record<$.Cast<X, Reference>, Unwrap<Y>>
      : never
  >,
  object
>

export type InputGroupReducer<
  T = unknown,
  U extends Model<State, Actions> = Model<State, Actions>
> = (
  values: Values<U['log']>,
  model: { state: U['state']; log: U['log'] }
) => T | Promise<T>

export type GenericInputGroupReducer<T = unknown> = (...args: any[]) => T
