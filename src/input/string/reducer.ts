import { isEmpty, map, uniq } from 'lodash-es'
import { normalizeString } from '../../utility/normalize'
import { DefaultInputStringReducer } from './types'

export const reducer: DefaultInputStringReducer = (_values, props) => {
  const values = normalizeString(_values, props)
  const strings = uniq(map(values, ({ value }) => value))

  if (isEmpty(strings)) {
    return props.model.state.default
  } else {
    if (props.model.state.repeat) {
      return strings
    }

    return strings[0]
  }
}
