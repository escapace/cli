import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import arg, { Handler, Spec } from 'arg'
import { assign, filter, flatMap, map } from 'lodash-es'
import { ActionInput, Command, TypeAction } from '../command/types'
import { InputGroup } from '../input/group/types'
import {
  Input,
  SYMBOL_INPUT_BOOLEAN,
  SYMBOL_INPUT_CHOICE,
  SYMBOL_INPUT_COUNT,
  SYMBOL_INPUT_GROUP,
  SYMBOL_INPUT_STRING
} from '../types'

const match = (
  input: Exclude<Input, InputGroup>
): string | Handler | [Handler] => {
  const state = input[SYMBOL_STATE]

  switch (state.type) {
    case SYMBOL_INPUT_BOOLEAN:
      return Boolean
    case SYMBOL_INPUT_CHOICE:
      return state.repeat ? [String] : String
    case SYMBOL_INPUT_COUNT:
      return arg.COUNT
    case SYMBOL_INPUT_STRING:
      return state.repeat ? [String] : String
  }
}

const next = (input: Input): Spec[] => {
  if (input[SYMBOL_STATE].type === SYMBOL_INPUT_GROUP) {
    return flatMap((input as InputGroup)[SYMBOL_STATE].inputs, (value) =>
      next(value)
    )
  } else {
    const type = match(input as Exclude<Input, InputGroup>)
    const options = input[SYMBOL_STATE].options

    return map(options, (option) => ({ [option]: type }))
  }
}

export const spec = (command: Command): Spec => {
  const log = command[SYMBOL_LOG]

  return assign(
    {},
    ...map(
      filter(log, ({ type }) => type === TypeAction.Input) as ActionInput[],
      ({ payload }): Spec => assign({}, ...next(payload))
    )
  )
}
