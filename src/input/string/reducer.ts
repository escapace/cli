import { isEmpty, map, uniq } from 'lodash-es'
import { message } from '../../utility/message'
import { normalize } from './normalize'
import { DefaultInputStringReducer } from './types'

export const reducer: DefaultInputStringReducer = (values, props) => {
  if (isEmpty(values)) {
    return props.model.state.default
  } else {
    const normalized = normalize(values, props)

    const uni = uniq(map(normalized, ({ value }) => value))

    if (props.model.state.repeat) {
      return uni
    }

    if (uni.length !== 1) {
      throw new Error(`Conflicting input for ${message(normalized)}`)
    }

    return uni[0]
  }
}
