import { isEmpty, reduce } from 'lodash-es'
import { GenericReducer } from '../../types'

export const reducer: GenericReducer<number> = (values, { state }) => {
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
