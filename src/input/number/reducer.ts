import { isEmpty, map } from 'lodash-es'
import { normalizeNumber } from '../../utilities/normalize'
import type { InputNumberReducerDefault } from './types'
import { CliError } from '../../error'

export const reducer: InputNumberReducerDefault = (_values, properties) => {
  const values = normalizeNumber(_values, properties)
  const numbers = map(values, ({ value }) => value)

  for (const number of numbers) {
    if (isNaN(number)) {
      throw new CliError(`Not a number ${number}`)
    }
  }

  if (isEmpty(numbers)) {
    return properties.model.state.default
  } else {
    if (properties.model.state.repeat) {
      return numbers
    }

    return numbers[0]
  }
}
