import { InputType } from '../types'
import { map, includes } from 'lodash-es'

export const message = (
  array: Array<{
    type: InputType.Option | InputType.Variable
    name: string
  }>
): string => {
  const seen: string[] = []

  return [
    ...map(array, ({ type, name }, index) => {
      if (includes(seen, name)) {
        return ''
      } else {
        seen.push(name)

        return `${
          /* (index === 0 ? capitalize : identity)( */
          type === InputType.Variable ? 'variable' : 'option'
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
