import { includes, map } from 'lodash-es'
import { type GenericOption, type GenericVariable, InputType } from '../types'

export const message = (
  array: Array<GenericOption<string | string[]> | GenericVariable<string>>,
  // Array<{
  //   type: InputType.Option | InputType.Variable
  //   name: string
  // }>
): string => {
  const seen: string[] = []

  return [
    ...map(array, (value, index) => {
      const name = value.name

      if (includes(seen, name)) {
        return ''
      } else {
        seen.push(name)

        return `${
          /* (index === 0 ? capitalize : identity)( */
          {
            [InputType.Option]: 'option',
            [InputType.Variable]: 'variable',
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
    '.',
  ].join('')
}
