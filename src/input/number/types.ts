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
  DeNormalizedNumberValue,
  InputPropertiesShared,
  // InputType,
  Reference,
  StateShared,
  StateSharedInitial,
  SYMBOL_INPUT_NUMBER,
} from '../../types'

export declare const INPUT_NUMBER_INTERFACE: unique symbol
export declare const INPUT_NUMBER_SPECIFICATION: unique symbol
export declare const INPUT_NUMBER_REDUCER: unique symbol

export enum InputNumberTypeAction {
  Default,
  Description,
  Option,
  Reference,
  Repeat,
  Variable,
}

export interface InputNumberActionReference<T extends Reference = Reference> {
  payload: T
  type: InputNumberTypeAction.Reference
}

export interface InputNumberActionDescription {
  payload: string
  type: InputNumberTypeAction.Description
}

export interface InputNumberActionRepeat {
  payload: undefined
  type: InputNumberTypeAction.Repeat
}

export interface InputNumberActionDefault<T extends number | number[] = number | number[]> {
  payload: T
  type: InputNumberTypeAction.Default
}

export interface InputNumberActionVariable<T extends string = string> {
  payload: T
  type: InputNumberTypeAction.Variable
}

export interface InputNumberActionOption<T extends string = string> {
  payload: {
    name: T
  }
  type: InputNumberTypeAction.Option
}

export type InputNumberActions = Array<
  | InputNumberActionDefault
  | InputNumberActionDescription
  | InputNumberActionOption
  | InputNumberActionReference
  | InputNumberActionRepeat
  | InputNumberActionVariable
>

type LookupDefault<T extends Model<InputNumberState, InputNumberActions>> = $.If<
  $.Equal<T['state']['repeat'], true>,
  number[],
  number
>

type InterfaceDefault<T extends Model<InputNumberState, InputNumberActions>> = <
  U extends LookupDefault<T>,
>(
  value: U,
) => Next<InputNumberSettings, T, InputNumberActionDefault<U>>
type InterfaceDescription<T extends Model<InputNumberState, InputNumberActions>> = (
  description: string,
) => Next<InputNumberSettings, T, InputNumberActionDescription>
type InterfaceOption<T extends Model<InputNumberState, InputNumberActions>> = <P extends string>(
  option: Exclude<P, $.Values<T['state']['options']>>,
) => Next<InputNumberSettings, T, InputNumberActionOption<P>>
type InterfaceReference<T extends Model<InputNumberState, InputNumberActions>> = <
  U extends Reference,
>(
  reference: U,
) => Next<InputNumberSettings, T, InputNumberActionReference<U>>
type InterfaceRepeat<T extends Model<InputNumberState, InputNumberActions>> = () => Next<
  InputNumberSettings,
  T,
  InputNumberActionRepeat
>
type InterfaceVariable<T extends Model<InputNumberState, InputNumberActions>> = <P extends string>(
  variable: Exclude<P, $.Values<T['state']['variables']>>,
) => Next<InputNumberSettings, T, InputNumberActionVariable<P>>

interface Interface<T extends Model<InputNumberState, InputNumberActions>>
  extends FluentInterface<T> {
  default: InterfaceDefault<T>
  description: InterfaceDescription<T>
  option: InterfaceOption<T>
  reference: InterfaceReference<T>
  repeat: InterfaceRepeat<T>
  variable: InterfaceVariable<T>
}

export interface InputNumberSettings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_NUMBER_INTERFACE
  [Options.Reducer]: typeof INPUT_NUMBER_REDUCER
  [Options.Specification]: typeof INPUT_NUMBER_SPECIFICATION
  [Options.State]: InputNumberState
}

export interface InputNumberState extends StateShared {
  default: number | number[] | undefined
  reducer: InputNumberReducerGeneric
  repeat: boolean
  type: typeof SYMBOL_INPUT_NUMBER
}

interface InitialState extends StateSharedInitial {
  default: undefined
  reducer: InputNumberReducerGeneric<number | undefined>
  repeat: false
  type: typeof SYMBOL_INPUT_NUMBER
}

interface Specification<T extends Model<InputNumberState>> {
  [InputNumberTypeAction.Reference]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'reference'
    [Options.Once]: $.True
    [Options.Type]: typeof InputNumberTypeAction.Reference
  }

  [InputNumberTypeAction.Description]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputNumberTypeAction.Reference
    [Options.Enabled]: $.True
    [Options.Keys]: 'description'
    [Options.Once]: $.True
    [Options.Type]: typeof InputNumberTypeAction.Description
  }

  [InputNumberTypeAction.Repeat]: {
    [Options.Conflicts]: typeof InputNumberTypeAction.Option | typeof InputNumberTypeAction.Variable
    [Options.Dependencies]: typeof InputNumberTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'repeat'
    [Options.Once]: $.True
    [Options.Type]: typeof InputNumberTypeAction.Repeat
  }

  [InputNumberTypeAction.Option]: {
    [Options.Conflicts]: typeof InputNumberTypeAction.Default
    [Options.Dependencies]: typeof InputNumberTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'option'
    [Options.Once]: $.False
    [Options.Type]: typeof InputNumberTypeAction.Option
  }

  [InputNumberTypeAction.Variable]: {
    [Options.Conflicts]: typeof InputNumberTypeAction.Default
    [Options.Dependencies]: typeof InputNumberTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'variable'
    [Options.Once]: $.False
    [Options.Type]: typeof InputNumberTypeAction.Variable
  }

  [InputNumberTypeAction.Default]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputNumberTypeAction.Description
    [Options.Enabled]: $.Equal<T['state']['isEmpty'], false>
    [Options.Keys]: 'default'
    [Options.Once]: $.True
    [Options.Type]: typeof InputNumberTypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_NUMBER_INTERFACE]: Interface<$.Cast<A, Model<InputNumberState>>>
    [INPUT_NUMBER_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_NUMBER_SPECIFICATION]: Specification<$.Cast<A, Model<InputNumberState>>>
  }
}

type ReducerReducer<T extends Action[]> = $.If<
  $.Is.Never<PayloadActionRepeat<T>>,
  $.If<
    $.Is.Never<PayloadActionDefault<T>>,
    InputNumberReducerGeneric<number | undefined>,
    InputNumberReducerGeneric<number>
  >,
  InputNumberReducerGeneric<number[]>
>

type PayloadActionDefault<T extends Action[]> = Payload<$.Values<T>, InputNumberTypeAction.Default>
type PayloadActionOption<T extends Action[]> = Payload<$.Values<T>, InputNumberTypeAction.Option>
type PayloadActionReference<T extends Action[]> = Payload<
  $.Values<T>,
  InputNumberTypeAction.Reference
>
type PayloadActionRepeat<T extends Action[]> = Payload<$.Values<T>, InputNumberTypeAction.Repeat>
type PayloadActionVariable<T extends Action[]> = Payload<
  $.Values<T>,
  InputNumberTypeAction.Variable
>

interface Reducer<T extends Action[]> {
  [InputNumberTypeAction.Default]: {
    default: PayloadActionDefault<T>
    reducer: ReducerReducer<T>
  }
  [InputNumberTypeAction.Description]: {
    description: string
  }
  [InputNumberTypeAction.Option]: {
    isEmpty: false
    options: Array<PayloadActionOption<T> extends { name: infer U } ? U : never>
  }
  [InputNumberTypeAction.Reference]: {
    reference: PayloadActionReference<T>
  }
  [InputNumberTypeAction.Repeat]: {
    reducer: ReducerReducer<T>
    repeat: true
  }
  [InputNumberTypeAction.Variable]: {
    isEmpty: false
    variables: Array<PayloadActionVariable<T> extends { name: infer U } ? U : never>
  }
}

export interface InputNumberStateInitial extends InputNumberState {
  isEmpty: false
}

export interface InputNumber
  extends FluentInterface<Model<InputNumberStateInitial, InputNumberActions>> {}

// type ValuesOptions<T extends string> = $.If<
//   $.Is.Never<T>,
//   never,
//   {
//     name: T
//     type: InputType.Option
//     value: string
//   }
// >
//
// type ValuesVariables<T extends string> = $.If<
//   $.Is.Never<T>,
//   never,
//   {
//     name: T
//     type: InputType.Variable
//     value: string
//   }
// >

// type Values<T extends Model<InputNumberState, InputNumberActions>> = Array<
//   | ValuesOptions<$.Values<T['state']['options']>>
//   | ValuesVariables<$.Values<T['state']['variables']>>
// >

interface InputNumberModel {
  readonly log: InputNumber[typeof SYMBOL_LOG]
  readonly state: InputNumber[typeof SYMBOL_STATE]
}

export interface InputNumberProperties extends InputPropertiesShared {
  readonly model: InputNumberModel
}

type InputNumberReducerGeneric<T = unknown, U = any> = (
  values: U,
  properties: InputNumberProperties,
) => T

export type InputNumberReducerDefault = InputNumberReducerGeneric<any, DeNormalizedNumberValue[]>

// interface InputNumberEmpty
//   extends FluentInterface<Model<InputNumberState, InputNumberActions>> {}

// type InputNumberValuesLookup<T extends InputNumberEmpty> = Values<LookupModel<T>>
