import type { InputTypes, SYMBOL_INPUT_GROUP } from '../types'

export enum HelpType {
  Commands,
  Inputs,
}

export interface HelpHeader {
  argv: string[]
  description: string
}

export interface HelpCommands extends HelpHeader {
  commands: Array<{
    description: string
    name: string
  }>
  type: HelpType.Commands
}

export interface HelpInputsExcluding<
  T extends Exclude<InputTypes, typeof SYMBOL_INPUT_GROUP> = Exclude<
    InputTypes,
    typeof SYMBOL_INPUT_GROUP
  >,
> {
  depth: number
  description: string
  options: string | undefined
  type: T
  variables: string | undefined
}

export interface HelpInputs extends HelpHeader {
  inputs: Array<
    | HelpInputsExcluding
    | {
        depth: number
        description: string
        type: typeof SYMBOL_INPUT_GROUP
      }
  >
  type: HelpType.Inputs
}

export type Help = HelpCommands | HelpInputs
