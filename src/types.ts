import $ from '@escapace/typelevel'
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

export type GenericReducer<T = unknown> = (...args: any[]) => T

// type abc = { one: 1, two: 2, three: 3 }
// type qwe = { three: 'three', four: 4, five: 5 }

export type Merge<T extends object, U extends object> = Pick<
  T,
  $.Difference<keyof T, keyof U>
> &
  Pick<U, $.Difference<keyof U, keyof T>> &
  {
    [K in $.Intersection<keyof T, keyof U>]: T[K] | U[K]
  }

// type  qweqwe = Merge<{}, Record<"boolean", boolean | undefined>> | Merge<{}, Record<"choice", ("A" | "B" | "C")[]>>

export type UnionMerge<T extends object> = UnionToIntersection<
  T extends any ? (t: T) => T : never
> extends (_: any) => infer W
  ? W extends object
    ? Merge<W, Exclude<T, W>>
    : never
  : {}

// type qwee = UnionMerge<abc | qwe & qwe>
//
// type asdqwe = qwe['string']

// type current = Record<"groupA", Record<"choice", ("A" | "B" | "C")[]>> | Record<"groupA", "groupA return"> | Record<"boolean", boolean | undefined>
// type cint = UnionMerge<current>
//
// type asd  = cint['groupA']
//
