import { filter, isEmpty, reduce } from 'lodash-es'
import { GenericOption, InputType } from '../../types'
import { DefaultInputCountReducer } from './types'

export const reducer: DefaultInputCountReducer = (_values, props) => {
  const values = filter(
    _values,
    ({ type }) => type === InputType.Option
  ) as Array<GenericOption<number>>

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
