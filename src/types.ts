import { FluentInterface, Model } from '@escapace/fluent'

export const SYMBOL_INPUT_BOOLEAN = Symbol.for('ESCAPACE_CLI_INPUT_BOOLEAN')
export const SYMBOL_INPUT_CHOICE = Symbol.for('ESCAPACE_CLI_INPUT_CHOICE')
export const SYMBOL_INPUT_COUNT = Symbol.for('ESCAPACE_CLI_INPUT_COUNT')
export const SYMBOL_INPUT_STRING = Symbol.for('ESCAPACE_CLI_INPUT_STRING')
export const SYMBOL_COMMAND = Symbol.for('ESCAPACE_CLI_COMMAND')

export type Reference = string | number

// TODO: do we need a generic here
export interface SettingsVariable<T extends string = string> {
  split: (value: T) => string[]
}

export enum InputType {
  Option,
  Variable
}

export interface SharedState {
  description: string | undefined
  isEmpty: boolean
  options: string[]
  reference: Reference | undefined
  variables: string[]
}

export interface SharedInitialState {
  description: undefined
  isEmpty: true
  options: []
  reference: undefined
  variables: []
}

export type LookupModel<
  T extends FluentInterface<Model>
> = T extends FluentInterface<Model<infer S, infer L>> ? Model<S, L> : never

export interface Settings {
  env: Record<string, string | undefined>
  argv: string[]
}
