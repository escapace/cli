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
  DeNormalizedStringValue,
  InputType,
  LookupModel,
  InputPropertiesShared,
  Reference,
  StateSharedInitial,
  StateShared,
  SYMBOL_INPUT_STRING,
} from '../../types'

export declare const INPUT_STRING_INTERFACE: unique symbol
export declare const INPUT_STRING_SPECIFICATION: unique symbol
export declare const INPUT_STRING_REDUCER: unique symbol

export enum TypeAction {
  Default,
  Description,
  Option,
  Reference,
  Repeat,
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

export interface ActionRepeat {
  payload: undefined
  type: TypeAction.Repeat
}

export interface ActionDefault<T extends string | string[] = string | string[]> {
  payload: T
  type: TypeAction.Default
}

export interface ActionVariable<T extends string = string> {
  payload: T
  type: TypeAction.Variable
}

export interface ActionOption<T extends string = string> {
  payload: {
    name: T
  }
  type: TypeAction.Option
}

export type Actions = Array<
  ActionDefault | ActionDescription | ActionOption | ActionReference | ActionRepeat | ActionVariable
>

type LookupDefault<T extends Model<State, Actions>> = $.If<
  $.Equal<T['state']['repeat'], true>,
  string[],
  string
>

type InterfaceDefault<T extends Model<State, Actions>> = <U extends LookupDefault<T>>(
  value: U,
) => Next<Settings, T, ActionDefault<U>>
type InterfaceDescription<T extends Model<State, Actions>> = (
  description: string,
) => Next<Settings, T, ActionDescription>
type InterfaceOption<T extends Model<State, Actions>> = <P extends string>(
  option: Exclude<P, $.Values<T['state']['options']>>,
) => Next<Settings, T, ActionOption<P>>
type InterfaceReference<T extends Model<State, Actions>> = <U extends Reference>(
  reference: U,
) => Next<Settings, T, ActionReference<U>>
type InterfaceRepeat<T extends Model<State, Actions>> = () => Next<Settings, T, ActionRepeat>
type InterfaceVariable<T extends Model<State, Actions>> = <P extends string>(
  variable: Exclude<P, $.Values<T['state']['variables']>>,
) => Next<Settings, T, ActionVariable<P>>

interface Interface<T extends Model<State, Actions>> extends FluentInterface<T> {
  default: InterfaceDefault<T>
  description: InterfaceDescription<T>
  option: InterfaceOption<T>
  reference: InterfaceReference<T>
  repeat: InterfaceRepeat<T>
  variable: InterfaceVariable<T>
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_STRING_INTERFACE
  [Options.Reducer]: typeof INPUT_STRING_REDUCER
  [Options.Specification]: typeof INPUT_STRING_SPECIFICATION
  [Options.State]: State
}

export interface State extends StateShared {
  default: string | string[] | undefined
  reducer: GenericInputStringReducer
  repeat: boolean
  type: typeof SYMBOL_INPUT_STRING
}

interface InitialState extends StateSharedInitial {
  default: undefined
  reducer: GenericInputStringReducer<string | undefined>
  repeat: false
  type: typeof SYMBOL_INPUT_STRING
}

interface Specification<T extends Model<State>> {
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

  [TypeAction.Repeat]: {
    [Options.Conflicts]: typeof TypeAction.Option | typeof TypeAction.Variable
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'repeat'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Repeat
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
    [Options.Enabled]: $.Equal<T['state']['isEmpty'], false>
    [Options.Keys]: 'default'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_STRING_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_STRING_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_STRING_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
  }
}

type ReducerReducer<T extends Action[]> = $.If<
  $.Is.Never<PayloadActionRepeat<T>>,
  $.If<
    $.Is.Never<PayloadActionDefault<T>>,
    GenericInputStringReducer<string | undefined>,
    GenericInputStringReducer<string>
  >,
  GenericInputStringReducer<string[]>
>

type PayloadActionDefault<T extends Action[]> = Payload<$.Values<T>, TypeAction.Default>
type PayloadActionOption<T extends Action[]> = Payload<$.Values<T>, TypeAction.Option>
type PayloadActionReference<T extends Action[]> = Payload<$.Values<T>, TypeAction.Reference>
type PayloadActionRepeat<T extends Action[]> = Payload<$.Values<T>, TypeAction.Repeat>
type PayloadActionVariable<T extends Action[]> = Payload<$.Values<T>, TypeAction.Variable>

interface Reducer<T extends Action[]> {
  [TypeAction.Default]: {
    default: PayloadActionDefault<T>
    reducer: ReducerReducer<T>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Option]: {
    isEmpty: false
    options: Array<PayloadActionOption<T> extends { name: infer U } ? U : never>
  }
  [TypeAction.Reference]: {
    reference: PayloadActionReference<T>
  }
  [TypeAction.Repeat]: {
    reducer: ReducerReducer<T>
    repeat: true
  }
  [TypeAction.Variable]: {
    isEmpty: false
    variables: Array<PayloadActionVariable<T> extends { name: infer U } ? U : never>
  }
}

export interface InputStringState extends State {
  isEmpty: false
}

export interface InputString extends FluentInterface<Model<InputStringState, Actions>> {}

type ValuesOptions<T extends string> = $.If<
  $.Is.Never<T>,
  never,
  {
    name: T
    type: InputType.Option
    value: string
  }
>

type ValuesVariables<T extends string> = $.If<
  $.Is.Never<T>,
  never,
  {
    name: T
    type: InputType.Variable
    value: string
  }
>

type Values<T extends Model<State, Actions>> = Array<
  | ValuesOptions<$.Values<T['state']['options']>>
  | ValuesVariables<$.Values<T['state']['variables']>>
>

interface ModelInputString {
  readonly log: InputString[typeof SYMBOL_LOG]
  readonly state: InputString[typeof SYMBOL_STATE]
}

export interface PropertiesInputString extends InputPropertiesShared {
  readonly model: ModelInputString
}

type GenericInputStringReducer<T = unknown, U = any> = (
  values: U,
  properties: PropertiesInputString,
) => T

export type DefaultInputStringReducer = GenericInputStringReducer<any, DeNormalizedStringValue[]>

export interface InputStringEmpty extends FluentInterface<Model<State, Actions>> {}

export type LookupValues<T extends InputStringEmpty> = Values<LookupModel<T>>
