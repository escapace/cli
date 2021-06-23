import { differenceWith, isEmpty, map, uniq } from 'lodash-es'
import { TypeNormalize } from '../../types'
import { message } from '../../utility/message'
import { normalize } from '../../utility/normalize'
import { DefaultInputChoiceReducer } from './types'

export const reducer: DefaultInputChoiceReducer = (values, props) => {
  if (isEmpty(values)) {
    return props.model.state.default
  } else {
    const normalized = normalize(
      {
        type: TypeNormalize.String,
        values,
        repeat: props.model.state.repeat
      },
      props
    )

    const differences = differenceWith(
      normalized,
      props.model.state.choices,
      (a, b) => a.value === b
    )

    if (differences.length !== 0) {
      throw new Error(`Unexpected input for ${message(normalized)}`)
    }

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
