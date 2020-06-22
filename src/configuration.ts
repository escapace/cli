import { SYMBOL_STATE } from '@escapace/fluent'
import $ from '@escapace/typelevel'
import { Command, CommandState } from './command/types'
import { InputBoolean, InputBooleanState } from './input/boolean/types'
import { InputChoice, InputChoiceState } from './input/choice/types'
import { InputCount, InputCountState } from './input/count/types'
import { InputGroup, InputGroupState } from './input/group/types'
import { InputString, InputStringState } from './input/string/types'
import { Input, UnionToIntersection } from './types'

export type ConfigurationInputBoolean<
  T extends InputBoolean,
  U extends InputBooleanState = T[typeof SYMBOL_STATE]
> = Partial<Record<Exclude<U['reference'], undefined>, boolean>>

export type ConfigurationInputChoice<
  T extends InputChoice,
  U extends InputChoiceState = T[typeof SYMBOL_STATE]
> = Partial<
  Record<
    Exclude<U['reference'], undefined>,
    $.If<$.Equal<U['repeat'], true>, U['choices'], $.Values<U['choices']>>
  >
>

export type ConfigurationInputCount<
  T extends InputCount,
  U extends InputCountState = T[typeof SYMBOL_STATE]
> = Partial<Record<Exclude<U['reference'], undefined>, number>>

export type ConfigurationInputString<
  T extends InputString,
  U extends InputStringState = T[typeof SYMBOL_STATE]
> = Partial<
  Record<
    Exclude<U['reference'], undefined>,
    $.If<$.Equal<U['repeat'], true>, string[], string>
  >
>

export type ConfigurationInputGroup<
  T extends InputGroup,
  U extends InputGroupState = T[typeof SYMBOL_STATE]
> = Partial<
  Record<
    Exclude<U['reference'], undefined>,
    UnionToIntersection<ConfigurationInput<$.Values<U['inputs']>>>
  >
>

export type ConfigurationInput<T extends Input> = T extends InputBoolean
  ? ConfigurationInputBoolean<T>
  : T extends InputChoice
  ? ConfigurationInputChoice<T>
  : T extends InputCount
  ? ConfigurationInputCount<T>
  : T extends InputString
  ? ConfigurationInputString<T>
  : T extends InputGroup
  ? ConfigurationInputGroup<T>
  : {}

export type ConfigurationCommand<
  T extends Command,
  U extends CommandState = T[typeof SYMBOL_STATE]
> = Partial<Record<Exclude<U['reference'], undefined>, Configuration<T>>>

// TODO: does not work with complex types
export type Configuration<
  T extends Command,
  U extends CommandState = T[typeof SYMBOL_STATE]
> = UnionToIntersection<
  $.Values<U['inputs']> | $.Values<U['commands']> extends Input
    ? ConfigurationInput<$.Values<U['inputs']>>
    : ConfigurationCommand<$.Values<U['commands']>>
>
