/* eslint-disable typescript/no-unsafe-function-type */

import type { FluentInterface, Model, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import type $ from '@escapace/typelevel'
import type { InputBoolean } from './input/boolean/types'
import type { InputChoice } from './input/choice/types'
import type { InputCount } from './input/count/types'
import type {
  InputGroup,
  InputGroupEmpty,
  LookupValues as InputGroupLookupValues,
} from './input/group/types'

import type {
  InputString,
  InputStringEmpty,
  LookupValues as InputStringLookupValues,
} from './input/string/types'

import type { Command, CommandEmpty, LookupValues as CommandLookupValues } from './command/types'

import type { Spec as Specification } from 'arg'
export type { Spec as Specification, Handler as SpecificationHandler } from 'arg'

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
  | typeof SYMBOL_INPUT_GROUP
  | typeof SYMBOL_INPUT_STRING

export type Reference = number | string

export enum InputType {
  Option,
  Variable,
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

export type Input = InputBoolean | InputChoice | InputCount | InputGroup | InputString

export interface GenericOption<T> {
  name: string
  type: InputType.Option
  value: T
}

export interface GenericVariable<T> {
  name: string
  type: InputType.Variable
  value: T
}

export type DeNormalizedStringValue = GenericOption<string | string[]> | GenericVariable<string>

// export type DeNormalizedNumberValue =
//   | GenericConfiguration<any>
//   | GenericOption<number | number[]>
//   | GenericVariable<string>

export type NormalizedStringValue = GenericOption<string> | GenericVariable<string>

// export type NormalizedNumberValue =
//   | GenericConfiguration<number>
//   | GenericOption<number>
//   | GenericVariable<number>

export type Unwrap<T> = T extends (...arguments_: any[]) => infer U ? Awaited<U> : never

type Merge<T extends object, U extends object> = {
  [K in Extract<keyof T, keyof U>]: T[K] | U[K]
} & Pick<T, $.Difference<keyof T, keyof U>> &
  Pick<U, $.Difference<keyof U, keyof T>>

export type UnionMerge<T extends object> =
  $.To.Intersection<T extends any ? (t: T) => T : never> extends (_: any) => infer W
    ? W extends object
      ? Merge<$.Cast<$.To.Intersection<Exclude<T, W>>, object>, W>
      : never
    : never

export interface Settings {
  // TODO: custom help function
  help: boolean | Function
  split: string
}

interface Console {
  error: (message?: any, ...optionalParameters: any[]) => Promise<void> | void
  log: (message?: any, ...optionalParameters: any[]) => Promise<void> | void
}

export interface Context {
  argv: string[]
  console: Console
  env: Record<string, string | undefined>
  exit: (code?: number) => Promise<void> | void
  exited: boolean
}

interface ModelInput {
  readonly log: Input[typeof SYMBOL_LOG]
  readonly state: Input[typeof SYMBOL_STATE]
}

export interface PropertiesShared {
  readonly commands: Command[]
  readonly context: Context
  readonly settings: Settings
}

export interface PropertiesInputShared extends PropertiesShared {}

export interface Intent {
  _: string[]
  commands: Command[]
  specification: Specification
}

export interface Match {
  _: string[]
  commands: Command[]
  options: Record<string, boolean | number | string | number[] | string[]>
  variables: Record<string, string | undefined>
}

export interface PropertiesInput extends PropertiesShared {
  readonly model: ModelInput
}

export type Compose = <T extends Command>(
  command: T,
  settings?: Partial<Settings>,
) => (context?: Partial<Omit<Context, 'exited'>>) => Promise<void>

export interface HelpOptions {
  indent: string
  newline: string
  ratio: number
  width: number
}

export type LookupValues<T extends CommandEmpty | InputGroupEmpty | InputStringEmpty> =
  T extends CommandEmpty
    ? CommandLookupValues<T>
    : T extends InputGroupEmpty
      ? InputGroupLookupValues<T>
      : T extends InputStringEmpty
        ? InputStringLookupValues<T>
        : never

export enum PLACEHOLDER_REFERENCES {
  COMMAND = '@escapace/cli/placeholder-command',
  HELP_BOOLEAN = '@escapace/cli/placeholder-help-boolean',
  INPUT = '@escapace/cli/placeholder-input',
  NAME = 'placeholder',
}
