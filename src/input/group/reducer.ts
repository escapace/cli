import { normalize } from './normalize'
import { GenericInputGroupReducer } from './types'
import { Reference } from './../../types'

export const reducer: GenericInputGroupReducer = async (
  values,
  props
): Promise<Record<Reference, any>> => normalize(values, props)
