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
  PropertiesInputShared,
  Reference,
  SharedInitialState,
  SharedState,
  SYMBOL_INPUT_CHOICE,
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

export interface ActionChoices<T extends string[] = string[]> {
  payload: T
  type: TypeAction.Choices
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
  | ActionChoices
  | ActionDefault
  | ActionDescription
  | ActionOption
  | ActionReference
  | ActionRepeat
  | ActionVariable
>

export type LookupChoices<T extends Model<State, Actions>> = $.Values<T['state']['choices']>

export type LookupDefault<T extends Model<State, Actions>> = $.If<
  $.Equal<T['state']['repeat'], true>,
  Array<LookupChoices<T>>,
  LookupChoices<T>
>

export interface Interface<T extends Model<State, Actions>> extends FluentInterface<T> {
  choices: <U extends string[]>(
    ...choices: U
  ) => Next<Settings, T, ActionChoices<Array<$.Values<U>>>>
  default: <U extends LookupDefault<T>>(value: U) => Next<Settings, T, ActionDefault<U>>
  description: (description: string) => Next<Settings, T, ActionDescription>
  option: <P extends string>(
    option: Exclude<P, $.Values<T['state']['options']>>,
  ) => Next<Settings, T, ActionOption<P>>
  reference: <U extends Reference>(reference: U) => Next<Settings, T, ActionReference<U>>
  repeat: () => Next<Settings, T, ActionRepeat>
  variable: <P extends string>(
    variable: Exclude<P, $.Values<T['state']['variables']>>,
  ) => Next<Settings, T, ActionVariable<P>>
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof INPUT_CHOICE_INTERFACE
  [Options.Reducer]: typeof INPUT_CHOICE_REDUCER
  [Options.Specification]: typeof INPUT_CHOICE_SPECIFICATION
  [Options.State]: State
}

export interface State extends SharedState {
  choices: string[]
  default: string | string[] | undefined
  reducer: GenericInputChoiceReducer<string | string[] | undefined>
  repeat: boolean
  type: typeof SYMBOL_INPUT_CHOICE
}

export interface InitialState extends SharedInitialState {
  choices: []
  default: undefined
  reducer: GenericInputChoiceReducer<string | undefined>
  repeat: false
  type: typeof SYMBOL_INPUT_CHOICE
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

  [TypeAction.Choices]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof TypeAction.Description
    [Options.Enabled]: $.True
    [Options.Keys]: 'choices'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Choices
  }

  [TypeAction.Repeat]: {
    [Options.Conflicts]: typeof TypeAction.Option | typeof TypeAction.Variable
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Enabled]: $.True
    [Options.Keys]: 'repeat'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Repeat
  }

  [TypeAction.Option]: {
    [Options.Conflicts]: typeof TypeAction.Default
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Enabled]: $.True
    [Options.Keys]: 'option'
    [Options.Once]: $.False
    [Options.Type]: typeof TypeAction.Option
  }

  [TypeAction.Variable]: {
    [Options.Conflicts]: typeof TypeAction.Default
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Enabled]: $.True
    [Options.Keys]: 'variable'
    [Options.Once]: $.False
    [Options.Type]: typeof TypeAction.Variable
  }

  [TypeAction.Default]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Enabled]: $.Not<$.Is.Never<Extract<$.Values<T['log']>, ActionOption | ActionVariable>>>
    [Options.Keys]: 'default'
    [Options.Once]: $.True
    [Options.Type]: typeof TypeAction.Default
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_CHOICE_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_CHOICE_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [INPUT_CHOICE_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
  }
}

type ReducerRedcuer<T extends Action[]> = $.If<
  $.Is.Never<Payload<$.Values<T>, TypeAction.Repeat>>,
  $.If<
    $.Is.Never<Payload<$.Values<T>, TypeAction.Default>>,
    GenericInputChoiceReducer<$.Values<Payload<$.Values<T>, TypeAction.Choices>> | undefined>,
    GenericInputChoiceReducer<$.Values<Payload<$.Values<T>, TypeAction.Choices>>>
  >,
  GenericInputChoiceReducer<Payload<$.Values<T>, TypeAction.Choices>>
>

export interface Reducer<T extends Action[]> {
  [TypeAction.Choices]: {
    choices: Payload<$.Values<T>, TypeAction.Choices>
    isEmpty: false
    reducer: ReducerRedcuer<T>
  }
  [TypeAction.Default]: {
    default: Payload<$.Values<T>, TypeAction.Default>
    reducer: ReducerRedcuer<T>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Option]: {
    options: Array<Payload<$.Values<T>, TypeAction.Option> extends { name: infer U } ? U : never>
  }
  [TypeAction.Reference]: {
    reference: Payload<$.Values<T>, TypeAction.Reference>
  }
  [TypeAction.Repeat]: {
    reducer: ReducerRedcuer<T>
    repeat: true
  }
  [TypeAction.Variable]: {
    variables: Array<
      Payload<$.Values<T>, TypeAction.Variable> extends { name: infer U } ? U : never
    >
  }
}

export interface InputChoiceState extends State {
  isEmpty: false
}

export interface InputChoice extends FluentInterface<Model<InputChoiceState, Actions>> {}

export interface ModelInputChoice {
  readonly log: InputChoice[typeof SYMBOL_LOG]
  readonly state: InputChoice[typeof SYMBOL_STATE]
}

export interface PropertiesInputChoice extends PropertiesInputShared {
  readonly model: ModelInputChoice
}

export type GenericInputChoiceReducer<T = unknown, U = any> = (
  values: U,
  properties: PropertiesInputChoice,
) => T

export type DefaultInputChoiceReducer = GenericInputChoiceReducer<any, DeNormalizedStringValue[]>
