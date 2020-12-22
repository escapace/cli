import {
  normalize as n,
  NormalizedStringValue,
  InitialStringValue,
  NormalizeMode
} from '../../utility/normalize'
import { TypeAction, PropsInputString } from './types'
import { assign, map } from 'lodash-es'

export const normalize = (
  values: InitialStringValue[],
  props: PropsInputString
): NormalizedStringValue[] =>
  n({
    mode: NormalizeMode.String,
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
