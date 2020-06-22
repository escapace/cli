/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { compact, defaults, join, map } from 'lodash-es'
import stringWidth from 'string-width'
import { HelpOptions, PropsShared, SYMBOL_INPUT_GROUP } from '../types'
import { columns } from './columns'
import { HelpInputs, HelpType } from './types'
import { walk } from './walk/walk'
import { wrap } from './wrap'

const usage = (object: HelpInputs): string[] => {
  const array = compact(
    map(object.inputs, (value) =>
      value.type !== SYMBOL_INPUT_GROUP ? value.options : undefined
    )
  )

  return array
}

const helpOptions: HelpOptions = {
  indent: '',
  newline: '\n',
  ratio: 1.618,
  width: 100
}

export const help = async (
  props: PropsShared,
  options: Partial<HelpOptions> = helpOptions
): Promise<any> => {
  const { context } = props

  const opts: HelpOptions = defaults({}, options, helpOptions)

  const object = walk(props)
  const argvString = join(object.argv, ' ')

  const strings: string[] =
    object.type === HelpType.Commands
      ? [
          ...(stringWidth(`${argvString} - ${object.description}`) <= opts.width
            ? [`${argvString} - ${object.description}`]
            : [wrap(argvString, opts), '', wrap(object.description, opts)]),
          '',
          ...columns(
            object.commands.map(({ name, description }) => [
              name,
              description,
              undefined
            ]),
            opts
          )
        ]
      : [
          wrap(join([argvString, ...usage(object)], ' '), opts),
          '',
          wrap(object.description, opts),
          '',
          ...columns(
            object.inputs.map((value) => {
              if (value.type === SYMBOL_INPUT_GROUP) {
                return [value.description, undefined, value.depth]
              } else {
                return [
                  join(compact([value.options, value.variables]), ' '),
                  value.description,
                  value.depth
                ]
              }
            }),
            opts
          )
        ]

  await context.console.log(join(strings, '\n'))
}
