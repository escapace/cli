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
  PropertiesInputShared,
  Reference,
  SharedInitialState,
  SharedState,
  SYMBOL_INPUT_GROUP,
  UnionMerge,
  Unwrap,
} from '../../types'

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

export interface Interface<T extends Model<State, Actions>> extends FluentInterface<T> {
  description: (description: string) => Next<Settings, T, ActionDescription>
  input: <
    U extends Input,
    A extends Input[typeof SYMBOL_STATE] = $.Cast<
      Payload<$.Values<T['log']>, TypeAction.Input>,
      Input
    >[typeof SYMBOL_STATE],
    B extends Input[typeof SYMBOL_STATE] = U[typeof SYMBOL_STATE],
  >(
    input: U,
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
  reducer: <U>(reducer: InputGroupReducer<U, T>) => Next<Settings, T, ActionReducer<U>>
  reference: <U extends Reference>(reference: U) => Next<Settings, T, ActionReference<U>>
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_GROUP_INTERFACE
  [Options.Reducer]: typeof INPUT_GROUP_REDUCER
  [Options.Specification]: typeof INPUT_GROUP_SPECIFICATION
  [Options.State]: State
}

export interface State extends SharedState {
  inputs: Input[]
  reducer: GenericInputGroupReducer
  type: typeof SYMBOL_INPUT_GROUP
}

export interface InitialState extends SharedInitialState {
  inputs: []
  reducer: GenericInputGroupReducer
  type: typeof SYMBOL_INPUT_GROUP
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

export interface Reducer<T extends Action[]> {
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Input]: {
    inputs: Array<$.Cast<Payload<$.Values<T>, TypeAction.Input>, Input>>
    isEmpty: false
    options: Array<
      $.Cast<Payload<$.Values<T>, TypeAction.Input>, Input>[typeof SYMBOL_STATE] extends {
        options: Array<infer X>
      }
        ? X
        : never
    >
    reducer: GenericInputGroupReducer<Values<T>>
    variables: Array<
      $.Cast<Payload<$.Values<T>, TypeAction.Input>, Input>[typeof SYMBOL_STATE] extends {
        variables: Array<infer X>
      }
        ? X
        : never
    >
  }
  [TypeAction.Reducer]: {
    reducer: Payload<$.Values<T>, TypeAction.Reducer>
  }
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
}

export interface InputGroupState extends State {
  isEmpty: false
}

export interface InputGroup extends FluentInterface<Model<InputGroupState, Actions>> {}

type Values<
  T extends Actions,
  U = $.Cast<Payload<$.Values<T>, TypeAction.Input>, Input>[typeof SYMBOL_STATE],
> = $.Cast<
  UnionMerge<
    U extends { reducer: infer Y; reference: infer X }
      ? Record<$.Cast<X, Reference>, Unwrap<Y>>
      : never
  >,
  object
>

export interface ModelInputGroup {
  readonly log: InputGroup[typeof SYMBOL_LOG]
  readonly state: InputGroup[typeof SYMBOL_STATE]
}

export interface PropertiesInputGroup extends PropertiesInputShared {
  readonly model: ModelInputGroup
}

export type GenericInputGroupReducer<T = unknown, U = any> = (
  values: U,
  properties: PropertiesInputGroup,
) => T

// type DefaultInputGroupReducer = GenericInputGroupReducer<
//   any,
//   Array<GenericOption<any> | GenericVariable<any>>
// >

export type InputGroupReducer<
  T = unknown,
  U extends Model<State, Actions> = Model<State, Actions>,
> = (
  values: Values<U['log']>,
  properties: { model: { log: U['log']; state: U['state'] } } & PropertiesInputShared,
) => Promise<T> | T

export interface InputGroupEmpty extends FluentInterface<Model<State, Actions>> {}

export type LookupValues<T extends InputGroupEmpty> = Values<LookupModel<T>['log']>
