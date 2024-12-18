import { isEmpty, map, uniq } from 'lodash-es'
import { normalizeString } from '../../utilities/normalize'
import type { InputStringReducerDefault } from './types'

export const reducer: InputStringReducerDefault = (_values, properties) => {
  const values = normalizeString(_values, properties)
  const strings = uniq(map(values, ({ value }) => value))

  if (isEmpty(strings)) {
    return properties.model.state.default
  } else {
    if (properties.model.state.repeat) {
      return strings
    }

    return strings[0]
  }
}
