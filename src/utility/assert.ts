import { SYMBOL_STATE } from '@escapace/fluent'

import {
  every,
  filter,
  flatMap,
  includes,
  intersection,
  isArray,
  isPlainObject,
  isBoolean,
  isFunction,
  isNumber,
  isString,
  isUndefined,
  map
} from 'lodash-es'

import {
  Actions as CommandActions,
  ActionSubcommand as CommandActionSubcommand,
  Command,
  State as CommandState,
  TypeAction as CommandTypeAction
} from '../command/types'

import {
  Actions as InputGroupActions,
  State as InputGroupState
} from '../input/group/types'

import {
  Input,
  Reference,
  SYMBOL_COMMAND,
  SYMBOL_INPUT_BOOLEAN,
  SYMBOL_INPUT_CHOICE,
  SYMBOL_INPUT_COUNT,
  SYMBOL_INPUT_STRING,
  SYMBOL_INPUT_GROUP
} from '../types'

import { extract } from './extract'

function ok(condition: boolean, message: string): asserts condition {
  if (!condition) {
    // TODO: remove last error stack line
    const error = new TypeError(message)
    error.name = 'Assertion Error'

    throw error
  }
}

const isCondTuple = (values: unknown[]) =>
  values.length > 0 &&
  values[0] !== values[1] &&
  (isString(values[0])
    ? isUndefined(values[1]) || isString(values[1])
    : isUndefined(values[0]) && isString(values[1]))

const assertions = {
  ok,
  string(value: unknown): asserts value is string {
    ok(isString(value), 'Not a string.')
  },
  configuration(value: unknown): asserts value is Record<Reference, any> {
    ok(isPlainObject(value), 'Not a plain object.')
  },
  function(value: unknown): asserts value is Function {
    ok(isFunction(value), 'Not a function.')
  },
  strings(values: unknown): asserts values is string[] {
    ok(
      isArray(values) && every(values, (value) => isString(value)),
      'Assertion error.'
    )
  },
  number(value: unknown): asserts value is number {
    ok(isNumber(value), 'Not a number.')
  },
  boolean(value: unknown): asserts value is boolean {
    ok(isBoolean(value), 'Not a boolean.')
  },
  reference(value: unknown): asserts value is Reference {
    // TODO: is object key
    ok(
      isNumber(value) || (isString(value) && value !== '_'),
      'Not a sring or number.'
    )
  },
  inputDichotomousOption(
    values: unknown[],
    options: string[]
  ): asserts values is
    | [string, string]
    | [string, undefined]
    | [undefined, string] {
    // TODO: option regex
    ok(
      isCondTuple(values) && intersection(values, options).length === 0,
      // TODO: write a better error message
      'Assertion Error'
    )
  },
  inputBooleanVariable(
    values: unknown[],
    variables: string[]
  ): asserts values is
    | [string, string]
    | [string, undefined]
    | [undefined, string] {
    // TODO: env var regex
    ok(
      isCondTuple(values) && intersection(values, variables).length === 0,
      // TODO: write a better error message
      'Assertion Error'
    )
  },
  inputChoiceDefault(
    value: unknown,
    choices: string[],
    repeat: boolean
  ): asserts value is string | string[] {
    ok(
      repeat
        ? isArray(value) && every(value, (v) => includes(choices, v))
        : includes(choices, value),
      'Assertion Error'
    )
  },
  inputStringDefault(
    value: unknown,
    repeat: boolean
  ): asserts value is string | string[] {
    ok(
      repeat
        ? isArray(value) && every(value, (v) => isString(v))
        : isString(value),
      'Assertion Error'
    )
  },
  option(value: unknown, options: string[]): asserts value is string {
    // TODO: option regex
    ok(isString(value) && !includes(options, value), 'Assertion Error')
  },
  variable(value: unknown, variables: string[]): asserts value is string {
    // TODO: option regex
    ok(isString(value) && !includes(variables, value), 'Assertion Error')
  },
  commandName(value: unknown): asserts value is string {
    // TODO: command-name regex
    ok(isString(value), 'Assertion Error')
  },
  command(
    value: unknown,
    model?: { state: CommandState; log: CommandActions }
  ): asserts value is Command {
    const state = extract(value as Command)[SYMBOL_STATE]

    ok(state.type === SYMBOL_COMMAND && !state.isEmpty, 'Assertion Error')

    if (model !== undefined) {
      const subcommands = filter(
        model.log,
        (action) => action.type === CommandTypeAction.Subcommand
      ) as CommandActionSubcommand[]

      // check names for direct children subcommands
      // check references

      ok(
        !includes(
          [
            model.state.reference,
            ...map(
              subcommands,
              (value) => value.payload[SYMBOL_STATE].reference
            )
          ],
          state.reference
        ),
        'Assertion Error'
      )

      ok(
        intersection(
          flatMap(subcommands, (value) => value.payload[SYMBOL_STATE].names),
          state.names
        ).length === 0,
        'Assertion Error'
      )
    }
  },
  input(
    value: unknown,
    model: {
      state: CommandState | InputGroupState
      log: CommandActions | InputGroupActions
    }
  ): asserts value is Input {
    const state = extract(value as Input)[SYMBOL_STATE]

    ok(
      includes(
        [
          SYMBOL_INPUT_BOOLEAN,
          SYMBOL_INPUT_CHOICE,
          SYMBOL_INPUT_COUNT,
          SYMBOL_INPUT_STRING,
          SYMBOL_INPUT_GROUP
        ],
        state.type
      ) && !state.isEmpty,
      'Assertion Error'
    )

    const inputs = model.state.inputs

    ok(
      !includes(
        [
          model.state.reference,
          ...map(inputs, (value) => value[SYMBOL_STATE].reference)
        ],
        state.reference
      ),
      'Assertion Error'
    )

    ok(
      intersection(model.state.options, state.options).length === 0,
      'Assertion Error'
    )

    ok(
      intersection(model.state.variables, state.variables).length === 0,
      'Assertion Error'
    )
  }
}

export const assert: typeof assertions = assertions
