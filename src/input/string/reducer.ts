import { isEmpty, map, uniq } from 'lodash-es'
import { message } from '../../utilities/message'
import { InitialStringValue } from '../../utilities/normalize'
import { normalize } from './normalize'
import { Actions, State } from './types'

export const reducer = (
  values: InitialStringValue[],
  model: { state: State; log: Actions }
) => {
  if (isEmpty(values)) {
    return model.state.default
  } else {
    const normalized = normalize(values, model)

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
