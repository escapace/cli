import { FluentInterface, Model } from '@escapace/fluent'
import { InputBoolean } from './input/boolean/types'
import { InputChoice } from './input/choice/types'
import { InputCount } from './input/count/types'
import { InputString } from './input/string/types'
import { InputGroup } from './input/group/types'

export const SYMBOL_INPUT_BOOLEAN = Symbol.for('ESCAPACE_CLI_INPUT_BOOLEAN')
export const SYMBOL_INPUT_CHOICE = Symbol.for('ESCAPACE_CLI_INPUT_CHOICE')
export const SYMBOL_INPUT_COUNT = Symbol.for('ESCAPACE_CLI_INPUT_COUNT')
export const SYMBOL_INPUT_STRING = Symbol.for('ESCAPACE_CLI_INPUT_STRING')
export const SYMBOL_INPUT_GROUP = Symbol.for('ESCAPACE_CLI_INPUT_GROUP')
export const SYMBOL_COMMAND = Symbol.for('ESCAPACE_CLI_COMMAND')

export type Reference = string | number | symbol

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
  help: Function
}

export interface SettingsEnvironment {
  env: Record<string, string | undefined>
  argv: string[]
}

export type Input =
  | InputBoolean
  | InputChoice
  | InputCount
  | InputString
  | InputGroup

export type Unwrap<T> = T extends (...args: any) => infer U
  ? U extends PromiseLike<infer R>
    ? R
    : U
  : never

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

export type GenericReducer<T = unknown> = (...args: any[]) => T
