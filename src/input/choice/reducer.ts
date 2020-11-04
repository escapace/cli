import { differenceWith, isEmpty, map, uniq, assign } from 'lodash-es'
import { TypeAction, State, Actions } from './types'
import {
  normalize,
  NormalizeMode,
  InitialStringValue
} from '../../utilities/normalize'
import { message } from '../../utilities/message'

export const reducer = (
  values: InitialStringValue[],
  model: { state: State; log: Actions }
) => {
  if (isEmpty(values)) {
    return model.state.default
  } else {
    const normalized = normalize({
      mode: NormalizeMode.String,
      values,
      variables: assign(
        {},
        ...map(model.log, (action) =>
          action.type === TypeAction.Variable
            ? { [action.payload.name]: action.payload.settings }
            : undefined
        )
      ),
      repeat: model.state.repeat
    })

    const differences = differenceWith(
      normalized,
      model.state.choices,
      (a, b) => a.value === b
    )

    if (differences.length !== 0) {
      throw new Error(`Unexpected input for ${message(normalized)}`)
    }

    const uni = uniq(map(normalized, ({ value }) => value))

    if (model.state.repeat) {
      return uni
    }

    if (uni.length !== 1) {
      throw new Error(`Conflicting input for ${message(normalized)}`)
    }

    return uni[0]
  }
}
