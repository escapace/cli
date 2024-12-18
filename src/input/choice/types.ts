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
  InputPropertiesShared,
  Reference,
  StateSharedInitial,
  StateShared,
  SYMBOL_INPUT_CHOICE,
} from '../../types'

export declare const INPUT_CHOICE_INTERFACE: unique symbol
export declare const INPUT_CHOICE_SPECIFICATION: unique symbol
export declare const INPUT_CHOICE_REDUCER: unique symbol

export enum InputChoiceTypeAction {
  Choices,
  Default,
  Description,
  Option,
  Reference,
  Repeat,
  Variable,
}

export interface InputChoiceActionReference<T extends Reference = Reference> {
  payload: T
  type: InputChoiceTypeAction.Reference
}

export interface InputChoiceActionDescription {
  payload: string
  type: InputChoiceTypeAction.Description
}

export interface InputChoiceActionChoices<T extends string[] = string[]> {
  payload: T
  type: InputChoiceTypeAction.Choices
}

export interface InputChoiceActionRepeat {
  payload: undefined
  type: InputChoiceTypeAction.Repeat
}

export interface InputChoiceActionDefault<T extends string | string[] = string | string[]> {
  payload: T
  type: InputChoiceTypeAction.Default
}

export interface InputChoiceActionVariable<T extends string = string> {
  payload: T
  type: InputChoiceTypeAction.Variable
}

export interface InputChoiceActionOption<T extends string = string> {
  payload: {
    name: T
  }
  type: InputChoiceTypeAction.Option
}

export type InputChoiceActions = Array<
  | InputChoiceActionChoices
  | InputChoiceActionDefault
  | InputChoiceActionDescription
  | InputChoiceActionOption
  | InputChoiceActionReference
  | InputChoiceActionRepeat
  | InputChoiceActionVariable
>

type LookupChoices<T extends Model<InputChoiceState, InputChoiceActions>> = $.Values<
  T['state']['choices']
>

type LookupDefault<T extends Model<InputChoiceState, InputChoiceActions>> = $.If<
  $.Equal<T['state']['repeat'], true>,
  Array<LookupChoices<T>>,
  LookupChoices<T>
>

type InterfaceChoices<T extends Model<InputChoiceState, InputChoiceActions>> = <U extends string[]>(
  ...choices: U
) => Next<InputChoiceSettings, T, InputChoiceActionChoices<Array<$.Values<U>>>>
type InterfaceDefault<T extends Model<InputChoiceState, InputChoiceActions>> = <
  U extends LookupDefault<T>,
>(
  value: U,
) => Next<InputChoiceSettings, T, InputChoiceActionDefault<U>>
type InterfaceDescription<T extends Model<InputChoiceState, InputChoiceActions>> = (
  description: string,
) => Next<InputChoiceSettings, T, InputChoiceActionDescription>
type InterfaceOption<T extends Model<InputChoiceState, InputChoiceActions>> = <P extends string>(
  option: Exclude<P, $.Values<T['state']['options']>>,
) => Next<InputChoiceSettings, T, InputChoiceActionOption<P>>
type InterfaceReference<T extends Model<InputChoiceState, InputChoiceActions>> = <
  U extends Reference,
>(
  reference: U,
) => Next<InputChoiceSettings, T, InputChoiceActionReference<U>>
type InterfaceRepeat<T extends Model<InputChoiceState, InputChoiceActions>> = () => Next<
  InputChoiceSettings,
  T,
  InputChoiceActionRepeat
>
type InterfaceVariable<T extends Model<InputChoiceState, InputChoiceActions>> = <P extends string>(
  variable: Exclude<P, $.Values<T['state']['variables']>>,
) => Next<InputChoiceSettings, T, InputChoiceActionVariable<P>>

interface Interface<T extends Model<InputChoiceState, InputChoiceActions>>
  extends FluentInterface<T> {
  choices: InterfaceChoices<T>
  default: InterfaceDefault<T>
  description: InterfaceDescription<T>
  option: InterfaceOption<T>
  reference: InterfaceReference<T>
  repeat: InterfaceRepeat<T>
  variable: InterfaceVariable<T>
}

export interface InputChoiceSettings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_CHOICE_INTERFACE
  [Options.Reducer]: typeof INPUT_CHOICE_REDUCER
  [Options.Specification]: typeof INPUT_CHOICE_SPECIFICATION
  [Options.State]: InputChoiceState
}

export interface InputChoiceState extends StateShared {
  choices: string[]
  default: string | string[] | undefined
  reducer: InputChoiceReducerGeneric<string | string[] | undefined>
  repeat: boolean
  type: typeof SYMBOL_INPUT_CHOICE
}

interface InitialState extends StateSharedInitial {
  choices: []
  default: undefined
  reducer: InputChoiceReducerGeneric<string | undefined>
  repeat: false
  type: typeof SYMBOL_INPUT_CHOICE
}

interface Specification<T extends Model<InputChoiceState>> {
  [InputChoiceTypeAction.Reference]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'reference'
    [Options.Once]: $.True
    [Options.Type]: typeof InputChoiceTypeAction.Reference
  }

  [InputChoiceTypeAction.Description]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputChoiceTypeAction.Reference
    [Options.Enabled]: $.True
    [Options.Keys]: 'description'
    [Options.Once]: $.True
    [Options.Type]: typeof InputChoiceTypeAction.Description
  }

  [InputChoiceTypeAction.Choices]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputChoiceTypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'choices'
    [Options.Once]: $.True
    [Options.Type]: typeof InputChoiceTypeAction.Choices
  }

  [InputChoiceTypeAction.Repeat]: {
    [Options.Conflicts]: typeof InputChoiceTypeAction.Option | typeof InputChoiceTypeAction.Variable
    [Options.Dependencies]: typeof InputChoiceTypeAction.Choices
    [Options.Enabled]: $.True
    [Options.Keys]: 'repeat'
    [Options.Once]: $.True
    [Options.Type]: typeof InputChoiceTypeAction.Repeat
  }

  [InputChoiceTypeAction.Option]: {
    [Options.Conflicts]: typeof InputChoiceTypeAction.Default
    [Options.Dependencies]: typeof InputChoiceTypeAction.Choices
    [Options.Enabled]: $.True
    [Options.Keys]: 'option'
    [Options.Once]: $.False
    [Options.Type]: typeof InputChoiceTypeAction.Option
  }

  [InputChoiceTypeAction.Variable]: {
    [Options.Conflicts]: typeof InputChoiceTypeAction.Default
    [Options.Dependencies]: typeof InputChoiceTypeAction.Choices
    [Options.Enabled]: $.True
    [Options.Keys]: 'variable'
    [Options.Once]: $.False
    [Options.Type]: typeof InputChoiceTypeAction.Variable
  }

  [InputChoiceTypeAction.Default]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof InputChoiceTypeAction.Choices
    // TODO: conflict?
    [Options.Enabled]: $.Not<
      $.Is.Never<Extract<$.Values<T['log']>, InputChoiceActionOption | InputChoiceActionVariable>>
    >
    [Options.Keys]: 'default'
    [Options.Once]: $.True
    [Options.Type]: typeof InputChoiceTypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_CHOICE_INTERFACE]: Interface<$.Cast<A, Model<InputChoiceState>>>
    [INPUT_CHOICE_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_CHOICE_SPECIFICATION]: Specification<$.Cast<A, Model<InputChoiceState>>>
  }
}

type PayloadActionChoices<T extends Action[]> = Payload<$.Values<T>, InputChoiceTypeAction.Choices>
type PayloadActionDefault<T extends Action[]> = Payload<$.Values<T>, InputChoiceTypeAction.Default>
type PayloadActionOption<T extends Action[]> = Payload<$.Values<T>, InputChoiceTypeAction.Option>
type PayloadActionReference<T extends Action[]> = Payload<
  $.Values<T>,
  InputChoiceTypeAction.Reference
>
type PayloadActionRepeat<T extends Action[]> = Payload<$.Values<T>, InputChoiceTypeAction.Repeat>
type PayloadActionVariable<T extends Action[]> = Payload<
  $.Values<T>,
  InputChoiceTypeAction.Variable
>

type ReducerRedcuer<T extends Action[]> = $.If<
  $.Is.Never<PayloadActionRepeat<T>>,
  $.If<
    $.Is.Never<PayloadActionDefault<T>>,
    InputChoiceReducerGeneric<$.Values<PayloadActionChoices<T>> | undefined>,
    InputChoiceReducerGeneric<$.Values<PayloadActionChoices<T>>>
  >,
  InputChoiceReducerGeneric<Payload<$.Values<T>, InputChoiceTypeAction.Choices>>
>

interface Reducer<T extends Action[]> {
  [InputChoiceTypeAction.Choices]: {
    choices: PayloadActionChoices<T>
    isEmpty: false
    reducer: ReducerRedcuer<T>
  }
  [InputChoiceTypeAction.Default]: {
    default: PayloadActionDefault<T>
    reducer: ReducerRedcuer<T>
  }
  [InputChoiceTypeAction.Description]: {
    description: string
  }
  [InputChoiceTypeAction.Option]: {
    options: Array<PayloadActionOption<T> extends { name: infer U } ? U : never>
  }
  [InputChoiceTypeAction.Reference]: {
    reference: PayloadActionReference<T>
  }
  [InputChoiceTypeAction.Repeat]: {
    reducer: ReducerRedcuer<T>
    repeat: true
  }
  [InputChoiceTypeAction.Variable]: {
    variables: Array<PayloadActionVariable<T> extends { name: infer U } ? U : never>
  }
}

export interface InputChoiceStateInitial extends InputChoiceState {
  isEmpty: false
}

export interface InputChoice
  extends FluentInterface<Model<InputChoiceStateInitial, InputChoiceActions>> {}

interface InputChoiceModel {
  readonly log: InputChoice[typeof SYMBOL_LOG]
  readonly state: InputChoice[typeof SYMBOL_STATE]
}

export interface InputChoiceProperties extends InputPropertiesShared {
  readonly model: InputChoiceModel
}

type InputChoiceReducerGeneric<T = unknown, U = any> = (
  values: U,
  properties: InputChoiceProperties,
) => T

export type InputChoiceReducerDefault = InputChoiceReducerGeneric<any, DeNormalizedStringValue[]>
