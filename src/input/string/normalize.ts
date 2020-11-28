import {
  normalize as n,
  NormalizeMode,
  InitialStringValue
} from '../../utility/normalize'
import { State, Actions, TypeAction } from './types'
import { assign, map } from 'lodash-es'

export const normalize = (
  values: InitialStringValue[],
  model: { state: State; log: Actions }
) =>
  n({
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
