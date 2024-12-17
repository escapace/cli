import { compact, defaults, join, map } from 'lodash-es'
import stringWidth from 'string-width'
import { type HelpOptions, type PropertiesShared, SYMBOL_INPUT_GROUP } from '../types'
import { columns } from './columns'
import { type HelpInputs, HelpType } from './types'
import { walk } from './walk/walk'
import { wrap } from './wrap'

const usage = (object: HelpInputs): string[] => {
  const array = compact(
    map(object.inputs, (value) => (value.type !== SYMBOL_INPUT_GROUP ? value.options : undefined)),
  )

  return array
}

const helpOptions: HelpOptions = {
  indent: '',
  newline: '\n',
  ratio: 1.618,
  width: 100,
}

export const help = async (
  properties: PropertiesShared,
  options: Partial<HelpOptions> = helpOptions,
): Promise<any> => {
  const { context } = properties

  const options_: HelpOptions = defaults({}, options, helpOptions)

  const object = walk(properties)
  const argvString = join(object.argv, ' ')

  const strings: string[] =
    object.type === HelpType.Commands
      ? [
          ...(stringWidth(`${argvString} - ${object.description}`) <= options_.width
            ? [`${argvString} - ${object.description}`]
            : [wrap(argvString, options_), '', wrap(object.description, options_)]),
          '',
          ...columns(
            object.commands.map(({ description, name }) => [name, description, undefined]),
            options_,
          ),
        ]
      : [
          wrap(join([argvString, ...usage(object)], ' '), options_),
          '',
          wrap(object.description, options_),
          '',
          ...columns(
            object.inputs.map((value) =>
              value.type === SYMBOL_INPUT_GROUP
                ? [value.description, undefined, value.depth]
                : [
                    join(compact([value.options, value.variables]), ' '),
                    value.description,
                    value.depth,
                  ],
            ),
            options_,
          ),
        ]

  await context.console.log(join(strings, '\n'))
}
