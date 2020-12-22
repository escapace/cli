import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assign, filter, includes, map, omit } from 'lodash-es'
import {
  GenericOption,
  GenericVariable,
  InputType,
  Reference
} from './../../types'
import { PropsInputGroup } from './types'

export const normalize = async (
  values: Array<GenericOption<any> | GenericVariable<any>>,
  props: PropsInputGroup
): Promise<Record<Reference, any>> =>
  assign(
    {},
    ...(await Promise.all(
      map(props.model.state.inputs, async (input) => {
        const state = input[SYMBOL_STATE]
        const log = input[SYMBOL_LOG]

        const filteredValues = filter(values, (value) =>
          includes(
            value.type === InputType.Option ? state.options : state.variables,
            value.name
          )
        )

        const prop: any = { model: { state, log }, ...omit(props, 'model') }

        return {
          [input[SYMBOL_STATE].reference as Reference]: await input[
            SYMBOL_STATE
          ].reducer(filteredValues, prop)
        }
      })
    ))
  )
