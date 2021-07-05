import { differenceWith, isEmpty, map, uniq } from 'lodash-es'
import { CliError } from '../../error'
import { message } from '../../utility/message'
import { normalizeString } from '../../utility/normalize'
import { DefaultInputChoiceReducer } from './types'

export const reducer: DefaultInputChoiceReducer = (values, props) => {
  const normalized = normalizeString(values, props)

  const differences = differenceWith(
    normalized,
    props.model.state.choices,
    (a, b) => a.value === b
  )

  if (differences.length !== 0) {
    throw new CliError(`Unexpected input for ${message(differences)}`)
  }

  if (isEmpty(normalized)) {
    return props.model.state.default
  } else {
    const uni = uniq(map(normalized, ({ value }) => value))

    if (props.model.state.repeat) {
      return uni
    }

    return uni[0]
  }
}
