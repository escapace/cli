import { assign, filter, includes, map } from 'lodash-es'
import { SYMBOL_STATE, SYMBOL_LOG } from '@escapace/fluent'
import { GenericOption, GenericVariable } from '../../utility/normalize'
import { State, Actions } from './types'
import { Reference, InputType } from './../../types'

export const normalize = async (
  values: Array<GenericOption<any> | GenericVariable<any>>,
  model: { state: State; log: Actions }
): Promise<Record<Reference, any>> =>
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  assign(
    {},
    ...(await Promise.all(
      map(model.state.inputs, async (input) => {
        const state = input[SYMBOL_STATE]
        const log = input[SYMBOL_LOG]

        const filteredValues = filter(values, (value) =>
          includes(
            value.type === InputType.Option ? state.options : state.variables,
            value.name
          )
        )

        return {
          [input[SYMBOL_STATE].reference as Reference]: await input[
            SYMBOL_STATE
          ].reducer(filteredValues, { state, log })
        }
      })
    ))
  )
