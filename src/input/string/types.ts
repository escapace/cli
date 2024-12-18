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

export enum InputStringTypeAction {
  Default,
  Description,
  Option,
  Reference,
  Repeat,
  Variable,
}

export interface InputStringActionReference<T extends Reference = Reference> {
  payload: T
  type: InputStringTypeAction.Reference
}

export interface InputStringActionDescription {
  payload: string
  type: InputStringTypeAction.Description
}

export interface InputStringActionRepeat {
  payload: undefined
  type: InputStringTypeAction.Repeat
}

export interface InputStringActionDefault<T extends string | string[] = string | string[]> {
  payload: T
  type: InputStringTypeAction.Default
}

export interface InputStringActionVariable<T extends string = string> {
  payload: T
  type: InputStringTypeAction.Variable
}

export interface InputStringActionOption<T extends string = string> {
  payload: {
    name: T
  }
  type: InputStringTypeAction.Option
}

export type InputStringActions = Array<
  | InputStringActionDefault
  | InputStringActionDescription
  | InputStringActionOption
  | InputStringActionReference
  | InputStringActionRepeat
  | InputStringActionVariable
>

type LookupDefault<T extends Model<InputStringState, InputStringActions>> = $.If<
  $.Equal<T['state']['repeat'], true>,
  string[],
  string
>

type InterfaceDefault<T extends Model<InputStringState, InputStringActions>> = <
  U extends LookupDefault<T>,
>(
  value: U,
) => Next<InputStringSettings, T, InputStringActionDefault<U>>
type InterfaceDescription<T extends Model<InputStringState, InputStringActions>> = (
  description: string,
) => Next<InputStringSettings, T, InputStringActionDescription>
type InterfaceOption<T extends Model<InputStringState, InputStringActions>> = <P extends string>(
  option: Exclude<P, $.Values<T['state']['options']>>,
) => Next<InputStringSettings, T, InputStringActionOption<P>>
type InterfaceReference<T extends Model<InputStringState, InputStringActions>> = <
  U extends Reference,
>(
  reference: U,
) => Next<InputStringSettings, T, InputStringActionReference<U>>
type InterfaceRepeat<T extends Model<InputStringState, InputStringActions>> = () => Next<
  InputStringSettings,
  T,
  InputStringActionRepeat
>
type InterfaceVariable<T extends Model<InputStringState, InputStringActions>> = <P extends string>(
  variable: Exclude<P, $.Values<T['state']['variables']>>,
) => Next<InputStringSettings, T, InputStringActionVariable<P>>

interface Interface<T extends Model<InputStringState, InputStringActions>>
  extends FluentInterface<T> {
  default: InterfaceDefault<T>
  description: InterfaceDescription<T>
  option: InterfaceOption<T>
  reference: InterfaceReference<T>
  repeat: InterfaceRepeat<T>
  variable: InterfaceVariable<T>
}

export interface InputStringSettings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_STRING_INTERFACE
  [Options.Reducer]: typeof INPUT_STRING_REDUCER
  [Options.Specification]: typeof INPUT_STRING_SPECIFICATION
  [Options.State]: InputStringState
}

export interface InputStringState extends StateShared {
  default: string | string[] | undefined
  reducer: InputStringReducerGeneric
  repeat: boolean
  type: typeof SYMBOL_INPUT_STRING
}

interface InitialState extends StateSharedInitial {
  default: undefined
  reducer: InputStringReducerGeneric<string | undefined>
  repeat: false
  type: typeof SYMBOL_INPUT_STRING
}

interface Specification<T extends Model<InputStringState>> {
  [InputStringTypeAction.Reference]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'reference'
    [Options.Once]: $.True
    [Options.Type]: typeof InputStringTypeAction.Reference
  }

  [InputStringTypeAction.Description]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputStringTypeAction.Reference
    [Options.Enabled]: $.True
    [Options.Keys]: 'description'
    [Options.Once]: $.True
    [Options.Type]: typeof InputStringTypeAction.Description
  }

  [InputStringTypeAction.Repeat]: {
    [Options.Conflicts]: typeof InputStringTypeAction.Option | typeof InputStringTypeAction.Variable
    [Options.Dependencies]: typeof InputStringTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'repeat'
    [Options.Once]: $.True
    [Options.Type]: typeof InputStringTypeAction.Repeat
  }

  [InputStringTypeAction.Option]: {
    [Options.Conflicts]: typeof InputStringTypeAction.Default
    [Options.Dependencies]: typeof InputStringTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'option'
    [Options.Once]: $.False
    [Options.Type]: typeof InputStringTypeAction.Option
  }

  [InputStringTypeAction.Variable]: {
    [Options.Conflicts]: typeof InputStringTypeAction.Default
    [Options.Dependencies]: typeof InputStringTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'variable'
    [Options.Once]: $.False
    [Options.Type]: typeof InputStringTypeAction.Variable
  }

  [InputStringTypeAction.Default]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputStringTypeAction.Description
    [Options.Enabled]: $.Equal<T['state']['isEmpty'], false>
    [Options.Keys]: 'default'
    [Options.Once]: $.True
    [Options.Type]: typeof InputStringTypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_STRING_INTERFACE]: Interface<$.Cast<A, Model<InputStringState>>>
    [INPUT_STRING_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_STRING_SPECIFICATION]: Specification<$.Cast<A, Model<InputStringState>>>
  }
}

type ReducerReducer<T extends Action[]> = $.If<
  $.Is.Never<PayloadActionRepeat<T>>,
  $.If<
    $.Is.Never<PayloadActionDefault<T>>,
    InputStringReducerGeneric<string | undefined>,
    InputStringReducerGeneric<string>
  >,
  InputStringReducerGeneric<string[]>
>

type PayloadActionDefault<T extends Action[]> = Payload<$.Values<T>, InputStringTypeAction.Default>
type PayloadActionOption<T extends Action[]> = Payload<$.Values<T>, InputStringTypeAction.Option>
type PayloadActionReference<T extends Action[]> = Payload<
  $.Values<T>,
  InputStringTypeAction.Reference
>
type PayloadActionRepeat<T extends Action[]> = Payload<$.Values<T>, InputStringTypeAction.Repeat>
type PayloadActionVariable<T extends Action[]> = Payload<
  $.Values<T>,
  InputStringTypeAction.Variable
>

interface Reducer<T extends Action[]> {
  [InputStringTypeAction.Default]: {
    default: PayloadActionDefault<T>
    reducer: ReducerReducer<T>
  }
  [InputStringTypeAction.Description]: {
    description: string
  }
  [InputStringTypeAction.Option]: {
    isEmpty: false
    options: Array<PayloadActionOption<T> extends { name: infer U } ? U : never>
  }
  [InputStringTypeAction.Reference]: {
    reference: PayloadActionReference<T>
  }
  [InputStringTypeAction.Repeat]: {
    reducer: ReducerReducer<T>
    repeat: true
  }
  [InputStringTypeAction.Variable]: {
    isEmpty: false
    variables: Array<PayloadActionVariable<T> extends { name: infer U } ? U : never>
  }
}

export interface InputStringStateInitial extends InputStringState {
  isEmpty: false
}

export interface InputString
  extends FluentInterface<Model<InputStringStateInitial, InputStringActions>> {}

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

type Values<T extends Model<InputStringState, InputStringActions>> = Array<
  | ValuesOptions<$.Values<T['state']['options']>>
  | ValuesVariables<$.Values<T['state']['variables']>>
>

interface ModelInputString {
  readonly log: InputString[typeof SYMBOL_LOG]
  readonly state: InputString[typeof SYMBOL_STATE]
}

export interface InputStringProperties extends InputPropertiesShared {
  readonly model: ModelInputString
}

type InputStringReducerGeneric<T = unknown, U = any> = (
  values: U,
  properties: InputStringProperties,
) => T

export type InputStringReducerDefault = InputStringReducerGeneric<any, DeNormalizedStringValue[]>

export interface InputStringEmpty
  extends FluentInterface<Model<InputStringState, InputStringActions>> {}

export type InputStringValuesLookup<T extends InputStringEmpty> = Values<LookupModel<T>>
