import { normalize } from './normalize'
import { Actions, State } from './types'
import { GenericOption, GenericVariable } from '../../utility/normalize'
import { Reference } from './../../types'

export const reducer = async (
  values: Array<GenericOption<any> | GenericVariable<any>>,
  model: { state: State; log: Actions }
): Promise<Record<Reference, any>> => normalize(values, model)
