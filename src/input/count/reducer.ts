import { isEmpty, reduce } from 'lodash-es'
import { DefaultInputCountReducer } from './types'

export const reducer: DefaultInputCountReducer = (values, props) => {
  if (isEmpty(values)) {
    return props.model.state.default
  } else {
    return reduce(
      values,
      (prev, curr) => {
        return prev + props.model.state.table[curr.name] * curr.value
      },
      0
    )
  }
}
