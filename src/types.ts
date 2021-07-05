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
import { Spec as Specification } from 'arg'
import { Configuration } from './configuration'
export { Spec as Specification, Handler as SpecificationHandler } from 'arg'

export const SYMBOL_INPUT_BOOLEAN = Symbol.for('ESCAPACE_CLI_INPUT_BOOLEAN')
export const SYMBOL_INPUT_CHOICE = Symbol.for('ESCAPACE_CLI_INPUT_CHOICE')
export const SYMBOL_INPUT_COUNT = Symbol.for('ESCAPACE_CLI_INPUT_COUNT')
export const SYMBOL_INPUT_STRING = Symbol.for('ESCAPACE_CLI_INPUT_STRING')
export const SYMBOL_INPUT_GROUP = Symbol.for('ESCAPACE_CLI_INPUT_GROUP')
export const SYMBOL_COMMAND = Symbol.for('ESCAPACE_CLI_COMMAND')

export type InputTypes =
  | typeof SYMBOL_INPUT_BOOLEAN
  | typeof SYMBOL_INPUT_CHOICE
  | typeof SYMBOL_INPUT_COUNT
  | typeof SYMBOL_INPUT_STRING
  | typeof SYMBOL_INPUT_GROUP

export type Reference = string | number

export enum InputType {
  Option,
  Variable,
  Configuration
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

export type LookupModel<T extends FluentInterface<Model>> =
  T extends FluentInterface<Model<infer S, infer L>> ? Model<S, L> : never

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

export interface GenericConfiguration<T> {
  type: InputType.Configuration
  name: string[]
  value: T
}

export type DeNormalizedStringValue =
  | GenericOption<string | string[]>
  | GenericVariable<string>
  | GenericConfiguration<any>

export type DeNormalizedNumberValue =
  | GenericOption<number | number[]>
  | GenericVariable<string>
  | GenericConfiguration<any>

export type NormalizedStringValue =
  | GenericOption<string>
  | GenericVariable<string>
  | GenericConfiguration<string>

export type NormalizedNumberValue =
  | GenericOption<number>
  | GenericVariable<number>
  | GenericConfiguration<number>

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
    ? Merge<$.Cast<UnionToIntersection<Exclude<T, W>>, object>, W>
    : never
  : never

export interface Settings {
  // TODO: custom help function
  help: Boolean | Function
  split: string
}

export interface Console {
  log: (message?: any, ...optionalParams: any[]) => void | Promise<void>
  error: (message?: any, ...optionalParams: any[]) => void | Promise<void>
}

export interface Context {
  env: Record<string, string | undefined>
  argv: string[]
  console: Console
  // TODO: unknown or Record<Reference, any>?
  configuration: unknown
  exit: (code?: number | undefined) => void | Promise<void>
  exited: boolean
}

export interface ModelInput {
  readonly state: Input[typeof SYMBOL_STATE]
  readonly log: Input[typeof SYMBOL_LOG]
}

export interface PropsShared {
  // readonly _: string[]
  readonly commands: Command[]
  readonly context: Context
  readonly settings: Settings
}

export interface PropsInputShared extends PropsShared {}

export interface Intent {
  _: string[]
  commands: Command[]
  specification: Specification
}

export interface Match {
  _: string[]
  commands: Command[]
  options: Record<string, boolean | string | string[] | number | number[]>
  variables: Record<string, string | undefined>
  configuration: Record<Reference, any>
}

export interface PropsInput extends PropsShared {
  readonly model: ModelInput
}

export type Compose = <T extends Command>(
  command: T,
  settings?: Partial<Settings>
) => (
  context?: Partial<Omit<Context, 'configuration' | 'exited'>> & {
    configuration?: Configuration<T>
  }
) => Promise<void>

export interface HelpOptions {
  indent: string
  newline: string
  ratio: number
  width: number
}
