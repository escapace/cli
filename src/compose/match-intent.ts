/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_STATE } from '@escapace/fluent'
import arg, {
  Result as ArgResult,
  Spec as ArgSpec,
  Options as ArgOptions
} from 'arg'
import { xor, omitBy, pick, map, get, slice, isError } from 'lodash-es'
import { CliError } from '../error'
import { Intent, Match, Context } from '../types'

const wrapArg = <T extends ArgSpec>(
  spec: ArgSpec,
  options: ArgOptions | undefined
): ArgResult<T> => {
  try {
    return arg(spec, options)
  } catch (e) {
    if (isError(e)) {
      throw new CliError(e.message)
    } else {
      throw new Error('Unexpected Error')
    }
  }
}

export const matchIntent = (
  intents: Intent[],
  context: Context
): Match | undefined => {
  let match: Match | undefined
  let index = 0

  while (index < intents.length) {
    const intent = intents[index]

    const options: Record<
      string,
      boolean | string | number | string[] | number[] | undefined
    > & { _: string[] } = wrapArg(
      intent.specification,
      {
        permissive: true,
        argv: context.argv
      }
      // context
    )

    const variables = pick(
      context.env,
      intent.commands.slice(-1)[0][SYMBOL_STATE].variables
    )

    if (xor(intent._, options._).length === 0) {
      match = {
        options: omitBy(
          options,
          (value, key) => key === '_' || value === undefined
        ) as Record<string, string | number | string[] | number[]>,
        variables,
        _: options._.slice(intent._.length),
        commands: intent.commands,
        configuration:
          intent.commands.length === 1
            ? context.configuration
            : get(
                context.configuration,
                map(
                  slice(intent.commands, 1),
                  (command) => command[SYMBOL_STATE].reference!
                )
              )
      }

      break
    } else {
      index++
    }
  }

  return match
}
