import $ from '@escapace/typelevel'
import {
  FluentInterface,
  Model,
  SYMBOL_LOG,
  SYMBOL_STATE
} from '@escapace/fluent'
import { InputBoolean } from './input/boolean/types'
import { InputChoice } from './input/choice/types'
import { InputCount } from './input/count/types'
import { InputString } from './input/string/types'
import { InputGroup } from './input/group/types'
import { Command } from './command/types'
import { Spec } from 'arg'

export const SYMBOL_INPUT_BOOLEAN = Symbol.for('ESCAPACE_CLI_INPUT_BOOLEAN')
export const SYMBOL_INPUT_CHOICE = Symbol.for('ESCAPACE_CLI_INPUT_CHOICE')
export const SYMBOL_INPUT_COUNT = Symbol.for('ESCAPACE_CLI_INPUT_COUNT')
export const SYMBOL_INPUT_STRING = Symbol.for('ESCAPACE_CLI_INPUT_STRING')
export const SYMBOL_INPUT_GROUP = Symbol.for('ESCAPACE_CLI_INPUT_GROUP')
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

export type Input =
  | InputBoolean
  | InputChoice
  | InputCount
  | InputString
  | InputGroup

export interface GenericOption<T> {
  type: InputType.Option
  name: string
  value: T
}

export interface GenericVariable<T> {
  type: InputType.Variable
  name: string
  value: T
}

export type DeNormalizedStringValue =
  | GenericOption<string | string[]>
  | GenericVariable<string>

export type DeNormalizedNumberValue =
  | GenericOption<number | number[]>
  | GenericVariable<string>

export type NormalizedStringValue =
  | GenericOption<string>
  | GenericVariable<string>

export type NormalizedNumberValue =
  | GenericOption<number>
  | GenericVariable<number>

export enum TypeNormalize {
  Number,
  String
}

export interface NormalizeSharedOptions {
  type: TypeNormalize
  repeat: boolean
  variables: { [key: string]: SettingsVariable }
}

export interface NormalizeStringOptions extends NormalizeSharedOptions {
  type: TypeNormalize.String
  values: DeNormalizedStringValue[]
}

export interface NormalizeNumberOptions extends NormalizeSharedOptions {
  type: TypeNormalize.Number
  values: DeNormalizedNumberValue[]
}

export type Unwrap<T> = T extends (...args: any[]) => infer U
  ? U extends PromiseLike<infer R>
    ? R
    : U
  : never

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

export type Merge<T extends object, U extends object> = Pick<
  T,
  $.Difference<keyof T, keyof U>
> &
  Pick<U, $.Difference<keyof U, keyof T>> &
  {
    [K in $.Intersection<keyof T, keyof U>]: T[K] | U[K]
  }

export type UnionMerge<T extends object> = UnionToIntersection<
  T extends any ? (t: T) => T : never
> extends (_: any) => infer W
  ? W extends object
    ? Merge<W, Exclude<T, W>>
    : never
  : {}

export interface Settings {
  help: Function
}

export interface SettingsEnvironment {
  env: Record<string, string | undefined>
  argv: string[]
}

export interface ModelInput {
  readonly state: Input[typeof SYMBOL_STATE]
  readonly log: Input[typeof SYMBOL_LOG]
}

export interface PropsShared {
  readonly commands: Command[]
  readonly settings: Settings
}

export interface Intent {
  models: Command[]
  commands: string[]
  spec: Spec
}

export interface Match {
  options: Record<string, string | string[] | number | number[]>
  variables: Record<string, string | undefined>
  arguments: string[]
  models: Command[]
}

// export interface PropsInput  extends PropsShared {
//   readonly model: ModelInput
// }

// export type GenericReducer<T = unknown> = (...args: any[]) => T
// export type GenericInputReducer<T = unknown> = (values: any, props: PropsInput) => T
