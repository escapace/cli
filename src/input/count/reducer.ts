import { InputCountReducer } from './types'
import { isEmpty, reduce } from 'lodash-es'

export const reducer: InputCountReducer<number> = (values, { state }) => {
  if (isEmpty(values)) {
    return state.default
  } else {
    return reduce(
      values,
      (prev, curr) => {
        return prev + state.table[curr.name] * curr.value
      },
      0
    )
  }
}
