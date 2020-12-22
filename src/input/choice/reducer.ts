import { differenceWith, isEmpty, map, uniq, assign } from 'lodash-es'
import { TypeAction, DefaultInputChoiceReducer } from './types'
import { normalize } from '../../utility/normalize'
import { message } from '../../utility/message'
import { TypeNormalize } from '../../types'

export const reducer: DefaultInputChoiceReducer = (values, props) => {
  if (isEmpty(values)) {
    return props.model.state.default
  } else {
    const normalized = normalize({
      type: TypeNormalize.String,
      values,
      variables: assign(
        {},
        ...map(props.model.log, (action) =>
          action.type === TypeAction.Variable
            ? { [action.payload.name]: action.payload.settings }
            : undefined
        )
      ),
      repeat: props.model.state.repeat
    })

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
