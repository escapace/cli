import { SYMBOL_STATE } from '@escapace/fluent'
import arg, {
  type Options as ArgumentOptions,
  type Result as ArgumentResult,
  type Spec as ArgumentSpec,
} from 'arg'
import { isError, omitBy, pick, xor } from 'lodash-es'
import { CliError } from '../error'
import type { Context, Intent, Match } from '../types'

const wrapArgument = <T extends ArgumentSpec>(
  spec: ArgumentSpec,
  options: ArgumentOptions | undefined,
): ArgumentResult<T> => {
  try {
    return arg(spec, options)
  } catch (_error) {
    const error = isError(_error) ? new CliError(_error.message) : new Error('Unexpected Error')
    throw error
  }
}

export const matchIntent = (intents: Intent[], context: Context): Match | undefined => {
  let match: Match | undefined
  let index = 0

  while (index < intents.length) {
    const intent = intents[index]

    const options: { _: string[] } & Record<
      string,
      boolean | number | string | number[] | string[] | undefined
    > = wrapArgument(
      intent.specification,
      {
        argv: context.argv,
        permissive: true,
      },
      // context
    )

    const variables = pick(context.env, intent.commands.slice(-1)[0][SYMBOL_STATE].variables)

    if (xor(intent._, options._).length === 0) {
      match = {
        _: options._.slice(intent._.length),
        commands: intent.commands,
        options: omitBy(options, (value, key) => key === '_' || value === undefined) as Record<
          string,
          number | string | number[] | string[]
        >,
        variables,
      }

      break
    } else {
      index++
    }
  }

  return match
}
