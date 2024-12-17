import { differenceWith, isEmpty, map, uniq } from 'lodash-es'
import { CliError } from '../../error'
import { message } from '../../utility/message'
import { normalizeString } from '../../utility/normalize'
import type { DefaultInputChoiceReducer } from './types'

export const reducer: DefaultInputChoiceReducer = (values, properties) => {
  const normalized = normalizeString(values, properties)

  const differences = differenceWith(
    normalized,
    properties.model.state.choices,
    (a, b) => a.value === b,
  )

  if (differences.length !== 0) {
    throw new CliError(`Unexpected input for ${message(differences)}`)
  }

  if (isEmpty(normalized)) {
    return properties.model.state.default
  } else {
    const uni = uniq(map(normalized, ({ value }) => value))

    if (properties.model.state.repeat) {
      return uni
    }

    return uni[0]
  }
}
