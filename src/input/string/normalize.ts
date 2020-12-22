import { assign, map } from 'lodash-es'
import {
  DeNormalizedStringValue,
  NormalizedStringValue,
  TypeNormalize
} from '../../types'
import { normalize as _normalize } from '../../utility/normalize'
import { PropsInputString, TypeAction } from './types'

export const normalize = (
  values: DeNormalizedStringValue[],
  props: PropsInputString
): NormalizedStringValue[] =>
  _normalize({
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
