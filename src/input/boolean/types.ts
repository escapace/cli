import $ from '@escapace/typelevel'

import {
  Action,
  Payload,
  FluentInterface,
  Model,
  Next,
  Options
} from '@escapace/fluent'

import {
  SYMBOL_INPUT_BOOLEAN,
  Reference,
  GenericReducer,
  InputType,
  SharedState,
  SharedInitialState
} from '../../types'

export declare const INPUT_BOOLEAN_INTERFACE: unique symbol
export declare const INPUT_BOOLEAN_SPECIFICATION: unique symbol
export declare const INPUT_BOOLEAN_REDUCER: unique symbol

export enum TypeAction {
  Default,
  Description,
  Option,
  Reference,
  Variable
}

export interface ActionReference<T extends Reference = Reference> {
  type: TypeAction.Reference
  payload: T
}

export interface ActionDescription {
  type: TypeAction.Description
  payload: string
}

export interface ActionDefault<T extends boolean = boolean> {
  type: TypeAction.Default
  payload: T
}

export interface TruthTable<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined
> {
  true: T
  false: U
}

export interface ActionVariable<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined
> {
  type: TypeAction.Variable
  payload: TruthTable<T, U>
}

export interface ActionOption<
  T extends string | undefined = string | undefined,
  U extends string | undefined = string | undefined
> {
  type: TypeAction.Option
  payload: TruthTable<T, U>
}

export type Actions = Array<
  | ActionDefault
  | ActionDescription
  | ActionOption
  | ActionReference
  | ActionVariable
>

export interface Interface<T extends Model<State, Actions>>
  extends FluentInterface<T> {
  reference: <U extends Reference>(
    reference: U
  ) => Next<Settings, T, ActionReference<U>>
  description: (description: string) => Next<Settings, T, ActionDescription>
  default: <U extends boolean>(value: U) => Next<Settings, T, ActionDefault<U>>
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
  variable: <
    P extends string | undefined = undefined,
    Q extends string | undefined = undefined
  >(
    ...values:
      | [Exclude<P, undefined | $.Values<T['state']['variables']>>]
      | [undefined, Exclude<Q, undefined | $.Values<T['state']['variables']>>]
      | [
          Exclude<P, undefined | $.Values<T['state']['variables']>>,
          Exclude<
            Exclude<Q, undefined | $.Values<T['state']['variables']>>,
            Exclude<P, undefined | $.Values<T['state']['variables']>>
          >
        ]
  ) => Next<Settings, T, ActionVariable<P, Q>>
}

export interface Settings {
  [Options.Interface]: typeof INPUT_BOOLEAN_INTERFACE
  [Options.Specification]: typeof INPUT_BOOLEAN_SPECIFICATION
  [Options.Reducer]: typeof INPUT_BOOLEAN_REDUCER
  [Options.InitialState]: InitialState
  [Options.State]: State
}

export interface State extends SharedState {
  type: typeof SYMBOL_INPUT_BOOLEAN
  default: boolean | undefined
  reducer: GenericReducer<boolean | undefined>
  table: {
    options: Record<string, boolean>
    variables: Record<string, boolean>
  }
}

export interface InitialState extends SharedInitialState {
  type: typeof SYMBOL_INPUT_BOOLEAN
  default: undefined
  reducer: GenericReducer<boolean | undefined>
  table: {
    options: Record<string, boolean>
    variables: Record<string, boolean>
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  [TypeAction.Variable]: {
    [Options.Type]: typeof TypeAction.Variable
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'variable'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Default
  }

  [TypeAction.Default]: {
    [Options.Type]: typeof TypeAction.Default
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Once]: $.True
    [Options.Keys]: 'default'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_BOOLEAN_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_BOOLEAN_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [INPUT_BOOLEAN_REDUCER]: Reducer<$.Cast<A, Action[]>>
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
    reducer: GenericReducer<boolean>
  }
  [TypeAction.Option]: {
    options: Payload<$.Values<T>, TypeAction.Option> extends {
      true: infer P
      false: infer Q
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
    isEmpty: false
  }
  [TypeAction.Variable]: {
    variables: Payload<$.Values<T>, TypeAction.Variable> extends {
      true: infer P
      false: infer Q
    }
      ? Array<Exclude<P, undefined> | Exclude<Q, undefined>>
      : []
    isEmpty: false
  }
}

export interface InputBooleanState extends State {
  isEmpty: false
}

export interface InputBoolean
  extends FluentInterface<Model<InputBooleanState, Actions>> {}

export type Values<T extends Model<State, Actions>> = Array<
  | $.If<
      $.Is.Never<$.Values<T['state']['options']>>,
      never,
      {
        type: InputType.Option
        name: $.Values<T['state']['options']>
        value: boolean
      }
    >
  | $.If<
      $.Is.Never<$.Values<T['state']['variables']>>,
      never,
      {
        type: InputType.Variable
        name: $.Values<T['state']['variables']>
        value: string
      }
    >
>

export type InputBooleanReducer<
  T = unknown,
  U extends Model<State, Actions> = Model<State, Actions>
> = (
  values: Values<U>,
  model: { state: U['state']; log: U['log'] }
) => T | Promise<T>
