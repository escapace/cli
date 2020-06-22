import { InputTypes, SYMBOL_INPUT_GROUP } from '../types'

export enum HelpType {
  Commands,
  Inputs
}

export interface HelpHeader {
  argv: string[]
  description: string
}

export interface HelpCommands extends HelpHeader {
  type: HelpType.Commands
  commands: Array<{
    name: string
    description: string
  }>
}

export interface HelpInputsExcluding<
  T extends Exclude<InputTypes, typeof SYMBOL_INPUT_GROUP> = Exclude<
    InputTypes,
    typeof SYMBOL_INPUT_GROUP
  >
> {
  type: T
  options: string | undefined
  variables: string | undefined
  description: string
  depth: number
}

export interface HelpInputs extends HelpHeader {
  type: HelpType.Inputs
  inputs: Array<
    | HelpInputsExcluding
    | {
        type: typeof SYMBOL_INPUT_GROUP
        description: string
        depth: number
      }
  >
}

export type Help = HelpCommands | HelpInputs
