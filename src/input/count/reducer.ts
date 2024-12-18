import { filter, isEmpty, reduce } from 'lodash-es'
import { InputType } from '../../types'
import type { DefaultInputCountReducer } from './types'

export const reducer: DefaultInputCountReducer = (_values, properties) => {
  const values = filter(_values, ({ type }) => type === InputType.Option)

  return isEmpty(values)
    ? properties.model.state.default
    : reduce(
        values,
        (previous, current) =>
          previous + properties.model.state.table[current.name] * current.value,
        0,
      )
}
