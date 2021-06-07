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
  PropsInputShared,
  Reference,
  SettingsVariable,
  SharedInitialState,
  SharedState,
  SYMBOL_INPUT_CHOICE
} from '../../types'

export declare const INPUT_CHOICE_INTERFACE: unique symbol
export declare const INPUT_CHOICE_SPECIFICATION: unique symbol
export declare const INPUT_CHOICE_REDUCER: unique symbol

export enum TypeAction {
  Choices,
  Default,
  Description,
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

export interface ActionChoices<T extends string[] = string[]> {
  type: TypeAction.Choices
  payload: T
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
  | ActionChoices
  | ActionDefault
  | ActionDescription
  | ActionOption
  | ActionReference
  | ActionRepeat
  | ActionVariable
>

export type LookupChoices<T extends Model<State, Actions>> = $.Values<
  T['state']['choices']
>

export type LookupDefault<T extends Model<State, Actions>> = $.If<
  $.Equal<T['state']['repeat'], true>,
  Array<LookupChoices<T>>,
  LookupChoices<T>
>

export interface Interface<T extends Model<State, Actions>>
  extends FluentInterface<T> {
  reference: <U extends Reference>(
    reference: U
  ) => Next<Settings, T, ActionReference<U>>
  description: (description: string) => Next<Settings, T, ActionDescription>
  choices: <U extends string[]>(
    ...choices: U
  ) => Next<Settings, T, ActionChoices<Array<$.Values<U>>>>
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
}

export interface Settings {
  [Options.Interface]: typeof INPUT_CHOICE_INTERFACE
  [Options.Specification]: typeof INPUT_CHOICE_SPECIFICATION
  [Options.Reducer]: typeof INPUT_CHOICE_REDUCER
  [Options.InitialState]: InitialState
  [Options.State]: State
}

export interface State extends SharedState {
  type: typeof SYMBOL_INPUT_CHOICE
  choices: string[]
  default: string | string[] | undefined
  reducer: GenericInputChoiceReducer<string | string[] | undefined>
  repeat: boolean
}

export interface InitialState extends SharedInitialState {
  type: typeof SYMBOL_INPUT_CHOICE
  choices: []
  default: undefined
  reducer: GenericInputChoiceReducer<string | undefined>
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

  [TypeAction.Choices]: {
    [Options.Type]: typeof TypeAction.Choices
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Keys]: 'choices'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [TypeAction.Repeat]: {
    [Options.Type]: typeof TypeAction.Repeat
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Keys]: 'repeat'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Option | typeof TypeAction.Variable
  }

  [TypeAction.Option]: {
    [Options.Type]: typeof TypeAction.Option
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Keys]: 'option'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Default
  }

  [TypeAction.Variable]: {
    [Options.Type]: typeof TypeAction.Variable
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Keys]: 'variable'
    [Options.Enabled]: $.True
    [Options.Conflicts]: typeof TypeAction.Default
  }

  [TypeAction.Default]: {
    [Options.Type]: typeof TypeAction.Default
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Once]: $.True
    [Options.Keys]: 'default'
    [Options.Enabled]: $.Not<
      $.Is.Never<Extract<$.Values<T['log']>, ActionVariable | ActionOption>>
    >
    [Options.Conflicts]: never
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_CHOICE_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_CHOICE_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [INPUT_CHOICE_REDUCER]: Reducer<$.Cast<A, Action[]>>
  }
}

type ReducerRedcuer<T extends Action[]> = $.If<
  $.Is.Never<Payload<$.Values<T>, TypeAction.Repeat>>,
  $.If<
    $.Is.Never<Payload<$.Values<T>, TypeAction.Default>>,
    GenericInputChoiceReducer<
      $.Values<Payload<$.Values<T>, TypeAction.Choices>> | undefined
    >,
    GenericInputChoiceReducer<
      $.Values<Payload<$.Values<T>, TypeAction.Choices>>
    >
  >,
  GenericInputChoiceReducer<Payload<$.Values<T>, TypeAction.Choices>>
>

export interface Reducer<T extends Action[]> {
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Option]: {
    options: Array<
      Payload<$.Values<T>, TypeAction.Option> extends { name: infer U }
        ? U
        : never
    >
  }
  [TypeAction.Variable]: {
    variables: Array<
      Payload<$.Values<T>, TypeAction.Variable> extends { name: infer U }
        ? U
        : never
    >
  }
  [TypeAction.Choices]: {
    choices: Payload<$.Values<T>, TypeAction.Choices>
    reducer: ReducerRedcuer<T>
    isEmpty: false
  }
  [TypeAction.Repeat]: {
    repeat: true
    reducer: ReducerRedcuer<T>
  }
  [TypeAction.Default]: {
    default: Payload<$.Values<T>, TypeAction.Default>
    reducer: ReducerRedcuer<T>
  }
}

export interface InputChoiceState extends State {
  isEmpty: false
}

export interface InputChoice
  extends FluentInterface<Model<InputChoiceState, Actions>> {}

export interface ModelInputChoice {
  readonly state: InputChoice[typeof SYMBOL_STATE]
  readonly log: InputChoice[typeof SYMBOL_LOG]
}

export interface PropsInputChoice extends PropsInputShared {
  readonly model: ModelInputChoice
}

export type GenericInputChoiceReducer<T = unknown, U = any> = (
  values: U,
  props: PropsInputChoice
) => T

export type DefaultInputChoiceReducer = GenericInputChoiceReducer<
  any,
  DeNormalizedStringValue[]
>
