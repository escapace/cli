import {
  GenericConfiguration,
  GenericOption,
  GenericVariable,
  InputType
} from '../types'
import { map, includes, join } from 'lodash-es'

export const message = (
  array: Array<
    | GenericOption<string | string[]>
    | GenericVariable<string>
    | GenericConfiguration<any>
  >
  // Array<{
  //   type: InputType.Option | InputType.Variable
  //   name: string
  // }>
): string => {
  const seen: string[] = []

  return [
    ...map(array, (value, index) => {
      const name =
        value.type === InputType.Configuration
          ? join(value.name, '.')
          : value.name

      if (includes(seen, name)) {
        return ''
      } else {
        seen.push(name)

        return `${
          /* (index === 0 ? capitalize : identity)( */
          {
            [InputType.Configuration]: 'configuration path',
            [InputType.Variable]: 'variable',
            [InputType.Option]: 'option'
          }[value.type]
          // type === InputType.Variable ? 'variable' : 'option'
          /* ) */
        } '${name}'${
          array.length === 1
            ? ''
            : index === array.length - 1
            ? ''
            : index === array.length - 2
            ? ', and '
            : ', '
        }`
      }
    }),
    '.'
  ].join('')
}
