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
  PropertiesInputShared,
  Reference,
  SharedInitialState,
  SharedState,
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

export interface TruthTable<
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

export interface Interface<T extends Model<State, Actions>> extends FluentInterface<T> {
  default: <U extends boolean>(value: U) => Next<Settings, T, ActionDefault<U>>
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
  variable: <P extends string | undefined = undefined, Q extends string | undefined = undefined>(
    ...values:
      | [
          Exclude<P, $.Values<T['state']['variables']> | undefined>,
          Exclude<
            Exclude<Q, $.Values<T['state']['variables']> | undefined>,
            Exclude<P, $.Values<T['state']['variables']> | undefined>
          >,
        ]
      | [Exclude<P, $.Values<T['state']['variables']> | undefined>]
      | [undefined, Exclude<Q, $.Values<T['state']['variables']> | undefined>]
  ) => Next<Settings, T, ActionVariable<P, Q>>
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_BOOLEAN_INTERFACE
  [Options.Reducer]: typeof INPUT_BOOLEAN_REDUCER
  [Options.Specification]: typeof INPUT_BOOLEAN_SPECIFICATION
  [Options.State]: State
}

export interface State extends SharedState {
  default: boolean | undefined
  reducer: GenericInputBooleanReducer<boolean | undefined>
  table: {
    options: Record<string, boolean>
    variables: Record<string, boolean>
  }
  type: typeof SYMBOL_INPUT_BOOLEAN
}

export interface InitialState extends SharedInitialState {
  default: undefined
  reducer: GenericInputBooleanReducer<boolean | undefined>
  table: {
    options: Record<string, boolean>
    variables: Record<string, boolean>
  }
  type: typeof SYMBOL_INPUT_BOOLEAN
}

export interface Specification<T extends Model<State>> {
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

export interface Reducer<T extends Action[]> {
  [TypeAction.Default]: {
    default: Payload<$.Values<T>, TypeAction.Default>
    reducer: GenericInputBooleanReducer<boolean>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Option]: {
    isEmpty: false
    options: Payload<$.Values<T>, TypeAction.Option> extends {
      false: infer Q
      true: infer P
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
  }
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
  [TypeAction.Variable]: {
    isEmpty: false
    variables: Payload<$.Values<T>, TypeAction.Variable> extends {
      false: infer Q
      true: infer P
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
  }
}

export type Values<T extends Model<State, Actions>> = Array<
  | $.If<
      $.Is.Never<$.Values<T['state']['options']>>,
      never,
      {
        name: $.Values<T['state']['options']>
        type: InputType.Option
        value: boolean
      }
    >
  | $.If<
      $.Is.Never<$.Values<T['state']['variables']>>,
      never,
      {
        name: $.Values<T['state']['variables']>
        type: InputType.Variable
        value: string
      }
    >
  | {
      type: InputType.Configuration
      value: unknown
    }
>

export interface InputBooleanState extends State {
  isEmpty: false
}

export interface InputBoolean extends FluentInterface<Model<InputBooleanState, Actions>> {}

export interface ModelInputBoolean {
  readonly log: InputBoolean[typeof SYMBOL_LOG]
  readonly state: InputBoolean[typeof SYMBOL_STATE]
}

export interface PropertiesInputBoolean extends PropertiesInputShared {
  readonly model: ModelInputBoolean
}

export type GenericInputBooleanReducer<T = unknown, U = any> = (
  values: U,
  properties: PropertiesInputBoolean,
) => T

export type DefaultInputBooleanReducer = GenericInputBooleanReducer<
  any,
  Values<Model<State, Actions>>
>
