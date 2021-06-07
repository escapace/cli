import {
  Action,
  FluentInterface,
  Model,
  Next,
  Options,
  Payload,
  SYMBOL_LOG,
  SYMBOL_STATE
} from '@escapace/fluent'
import $ from '@escapace/typelevel'
import {
  DeNormalizedStringValue,
  InputType,
  LookupModel,
  PropsInputShared,
  Reference,
  SettingsVariable,
  SharedInitialState,
  SharedState,
  SYMBOL_INPUT_STRING
} from '../../types'

export declare const INPUT_STRING_INTERFACE: unique symbol
export declare const INPUT_STRING_SPECIFICATION: unique symbol
export declare const INPUT_STRING_REDUCER: unique symbol

export enum TypeAction {
  Default,
  Description,
  Reducer,
  Option,
  Reference,
  Repeat,
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

export interface ActionRepeat {
  type: TypeAction.Repeat
  payload: undefined
}

export interface ActionDefault<
  T extends string | string[] = string | string[]
> {
  type: TypeAction.Default
  payload: T
}

export interface ActionReducer<T = unknown> {
  type: TypeAction.Reducer
  payload: GenericInputStringReducer<T>
}

export interface ActionVariable<T extends string = string> {
  type: TypeAction.Variable
  payload: {
    name: T
    settings: SettingsVariable
  }
}

export interface ActionOption<T extends string = string> {
  type: TypeAction.Option
  payload: {
    name: T
  }
}

export type Actions = Array<
  | ActionDefault
  | ActionDescription
  | ActionReducer
  | ActionOption
  | ActionReference
  | ActionRepeat
  | ActionVariable
>

export type LookupDefault<T extends Model<State, Actions>> = $.If<
  $.Equal<T['state']['repeat'], true>,
  string[],
  string
>

export interface Interface<T extends Model<State, Actions>>
  extends FluentInterface<T> {
  reference: <U extends Reference>(
    reference: U
  ) => Next<Settings, T, ActionReference<U>>
  description: (description: string) => Next<Settings, T, ActionDescription>
  repeat: () => Next<Settings, T, ActionRepeat>
  default: <U extends LookupDefault<T>>(
    value: U
  ) => Next<Settings, T, ActionDefault<U>>
  option: <P extends string>(
    option: Exclude<P, $.Values<T['state']['options']>>
  ) => Next<Settings, T, ActionOption<P>>
  variable: <P extends string>(
    variable: Exclude<P, $.Values<T['state']['variables']>>,
    settings?: SettingsVariable<P>
  ) => Next<Settings, T, ActionVariable<P>>
  reducer: <U>(
    reducer: InputStringReducer<U, T>
  ) => Next<Settings, T, ActionReducer<U>>
}

export interface Settings {
  [Options.Interface]: typeof INPUT_STRING_INTERFACE
  [Options.Specification]: typeof INPUT_STRING_SPECIFICATION
  [Options.Reducer]: typeof INPUT_STRING_REDUCER
  [Options.InitialState]: InitialState
  [Options.State]: State
}

export interface State extends SharedState {
  type: typeof SYMBOL_INPUT_STRING
  default: string | string[] | undefined
  reducer: GenericInputStringReducer
  repeat: boolean
}

export interface InitialState extends SharedInitialState {
  type: typeof SYMBOL_INPUT_STRING
  default: undefined
  reducer: GenericInputStringReducer<string | undefined>
  repeat: false
}

export interface Specification<T extends Model<State>> {
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

  [TypeAction.Repeat]: {
    [Options.Type]: typeof TypeAction.Repeat
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'repeat'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Option | typeof TypeAction.Variable
  }

  [TypeAction.Option]: {
    [Options.Type]: typeof TypeAction.Option
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'option'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Reducer | typeof TypeAction.Default
  }

  [TypeAction.Variable]: {
    [Options.Type]: typeof TypeAction.Variable
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'variable'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Reducer | typeof TypeAction.Default
  }

  [TypeAction.Default]: {
    [Options.Type]: typeof TypeAction.Default
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'default'
    [Options.Enabled]: $.Equal<T['state']['isEmpty'], false>
    [Options.Conflicts]: typeof TypeAction.Reducer
  }

  [TypeAction.Reducer]: {
    [Options.Type]: typeof TypeAction.Reducer
    [Options.Once]: $.True
    [Options.Dependencies]: never
    [Options.Enabled]: $.Equal<T['state']['isEmpty'], false>
    [Options.Keys]: 'reducer'
    [Options.Conflicts]: typeof TypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_STRING_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_STRING_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [INPUT_STRING_REDUCER]: Reducer<$.Cast<A, Action[]>>
  }
}

export type ReducerReducer<T extends Action[]> = $.If<
  $.Is.Never<Payload<$.Values<T>, TypeAction.Reducer>>,
  $.If<
    $.Is.Never<Payload<$.Values<T>, TypeAction.Repeat>>,
    $.If<
      $.Is.Never<Payload<$.Values<T>, TypeAction.Default>>,
      GenericInputStringReducer<string | undefined>,
      GenericInputStringReducer<string>
    >,
    GenericInputStringReducer<string[]>
  >,
  GenericInputStringReducer<
    ReturnType<Payload<$.Values<T>, TypeAction.Reducer>>
  >
>

export interface Reducer<T extends Action[]> {
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Repeat]: {
    repeat: true
    reducer: ReducerReducer<T>
  }
  [TypeAction.Default]: {
    default: Payload<$.Values<T>, TypeAction.Default>
    reducer: ReducerReducer<T>
  }
  [TypeAction.Reducer]: {
    reducer: GenericInputStringReducer<
      ReturnType<Payload<$.Values<T>, TypeAction.Reducer>>
    >
  }
  [TypeAction.Option]: {
    options: Array<
      Payload<$.Values<T>, TypeAction.Option> extends { name: infer U }
        ? U
        : never
    >
    isEmpty: false
  }
  [TypeAction.Variable]: {
    variables: Array<
      Payload<$.Values<T>, TypeAction.Variable> extends { name: infer U }
        ? U
        : never
    >
    isEmpty: false
  }
}

export interface InputStringState extends State {
  isEmpty: false
}

export interface InputString
  extends FluentInterface<Model<InputStringState, Actions>> {}

export type Values<T extends Model<State, Actions>> = Array<
  | $.If<
      $.Is.Never<$.Values<T['state']['options']>>,
      never,
      {
        type: InputType.Option
        name: $.Values<T['state']['options']>
        value: string
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

export interface ModelInputString {
  readonly state: InputString[typeof SYMBOL_STATE]
  readonly log: InputString[typeof SYMBOL_LOG]
}

export interface PropsInputString extends PropsInputShared {
  readonly model: ModelInputString
}

export type GenericInputStringReducer<T = unknown, U = any> = (
  values: U,
  props: PropsInputString
) => T

export type DefaultInputStringReducer = GenericInputStringReducer<
  any,
  DeNormalizedStringValue[]
>

export type InputStringReducer<
  T = unknown,
  U extends Model<State, Actions> = Model<State, Actions>
> = (
  values: Values<U>,
  props: {
    model: { state: U['state']; log: U['log'] }
  } & PropsInputShared
) => T | Promise<T>

export type LookupReducer<T extends FluentInterface<Model<State, Actions>>, U> =
  InputStringReducer<U, LookupModel<T>>
