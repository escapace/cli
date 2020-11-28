import { InputType, SettingsVariable } from '../types'
import { map, flatMap } from 'lodash'

interface GenericOption<T> {
  type: InputType.Option
  name: string
  value: T
}

interface GenericVariable<T> {
  type: InputType.Variable
  name: string
  value: T
}

export type InitialStringValue =
  | GenericOption<string | string[]>
  | GenericVariable<string>

export type InitialNumberValue =
  | GenericOption<number | number[]>
  | GenericVariable<string>

export type NormalizedStringValue =
  | GenericOption<string>
  | GenericVariable<string>

export type NormalizedNumberValue =
  | GenericOption<number>
  | GenericVariable<number>

export enum NormalizeMode {
  Number,
  String
}

interface NormalizeSharedOptions {
  mode: NormalizeMode
  repeat: boolean
  variables: { [key: string]: SettingsVariable }
}

interface NormalizeStringOptions extends NormalizeSharedOptions {
  mode: NormalizeMode.String
  values: InitialStringValue[]
}

interface NormalizeNumberOptions extends NormalizeSharedOptions {
  mode: NormalizeMode.Number
  values: InitialNumberValue[]
}

export function normalize(
  options: NormalizeNumberOptions
): NormalizedNumberValue[]
export function normalize(
  options: NormalizeStringOptions
): NormalizedStringValue[]
export function normalize(
  options: NormalizeStringOptions | NormalizeNumberOptions
): NormalizedStringValue[] | NormalizedNumberValue[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return flatMap<any, any>(
    options.values,
    (initial: InitialStringValue | InitialNumberValue) => {
      if (options.repeat) {
        const values: string[] =
          initial.type === InputType.Variable
            ? options.variables[initial.name].split(initial.value)
            : (initial.value as string[])

        return map(
          values,
          (value): NormalizedStringValue => ({
            ...initial,
            value
          })
        )
      } else {
        return initial as NormalizedStringValue
      }
    }
  )
}
