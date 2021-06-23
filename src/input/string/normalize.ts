import {
  DeNormalizedStringValue,
  NormalizedStringValue,
  TypeNormalize
} from '../../types'
import { normalize as _normalize } from '../../utility/normalize'
import { PropsInputString } from './types'

export const normalize = (
  values: DeNormalizedStringValue[],
  props: PropsInputString
): NormalizedStringValue[] =>
  _normalize(
    {
      type: TypeNormalize.String,
      values,
      repeat: props.model.state.repeat
    },
    props
  )
