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
  SYMBOL_INPUT_CHOICE,
  Reference,
  SettingsVariable,
  // InputType,
  SharedState,
  SharedInitialState
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

export type Actions =
  | ActionChoices
  | ActionDefault
  | ActionDescription
  | ActionOption
  | ActionReference
  | ActionRepeat
  | ActionVariable

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
    [Options.Conflicts]: typeof TypeAction.Default
  }

  [TypeAction.Default]: {
    [Options.Type]: typeof TypeAction.Default
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Once]: $.True
    [Options.Keys]: 'default'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [TypeAction.Option]: {
    [Options.Type]: typeof TypeAction.Option
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Keys]: 'option'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [TypeAction.Variable]: {
    [Options.Type]: typeof TypeAction.Variable
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Choices
    [Options.Keys]: 'variable'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [INPUT_CHOICE_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [INPUT_CHOICE_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [INPUT_CHOICE_REDUCER]: Reducer<$.Cast<A, Action>>
  }
}

export interface Reducer<T extends Action> {
  [TypeAction.Reference]: {
    reference: Payload<T, TypeAction.Reference>
  }
  [TypeAction.Description]: {
    description: string
  }
  [TypeAction.Choices]: {
    choices: Payload<T, TypeAction.Choices>
    reducer: GenericInputChoiceReducer<
      $.Values<Payload<T, TypeAction.Choices>> | undefined
    >
  }
  [TypeAction.Repeat]: {
    repeat: true
    reducer: GenericInputChoiceReducer<Payload<T, TypeAction.Choices>>
  }
  [TypeAction.Default]: {
    default: Payload<T, TypeAction.Default>
    reducer: $.If<
      $.Is.Never<Payload<T, TypeAction.Repeat>>,
      GenericInputChoiceReducer<$.Values<Payload<T, TypeAction.Choices>>>,
      GenericInputChoiceReducer<Payload<T, TypeAction.Choices>>
    >
  }
  [TypeAction.Option]: {
    options: Array<
      Payload<T, TypeAction.Option> extends { name: infer U } ? U : never
    >
    isEmpty: false
  }
  [TypeAction.Variable]: {
    variables: Array<
      Payload<T, TypeAction.Variable> extends { name: infer U } ? U : never
    >
    isEmpty: false
  }
}

export interface InputChoiceState extends State {
  isEmpty: false
}

export interface InputChoice
  extends FluentInterface<Model<InputChoiceState, Actions>> {}

// export type Values<T extends Model<State, Actions>> = Array<
//   | $.If<
//       $.Is.Never<$.Values<T['state']['options']>>,
//       never,
//       {
//         type: InputType.Option
//         name: $.Values<T['state']['options']>
//         value: string
//       }
//     >
//   | $.If<
//       $.Is.Never<$.Values<T['state']['variables']>>,
//       never,
//       {
//         type: InputType.Variable
//         name: $.Values<T['state']['variables']>
//         value: string
//       }
//     >
// >
//
// export type InputChoiceReducer<
//   T = unknown,
//   U extends Model<State, Actions> = Model<State, Actions>
// > = (
//   values: Values<U>,
//   model: { state: U['state']; log: Array<U['log']> }
// ) => T | Promise<T>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericInputChoiceReducer<T = unknown> = (...args: any[]) => T