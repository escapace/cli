/* eslint-disable typescript/no-unsafe-argument */
/* eslint-disable typescript/no-non-null-assertion */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assign, filter, includes, map, omit } from 'lodash-es'
import { type GenericOption, type GenericVariable, InputType, type Reference } from './../../types'
import type { GenericInputGroupReducer, PropertiesInputGroup } from './types'

export const wrap = async (
  values: Array<GenericOption<any> | GenericVariable<any>>,
  properties: PropertiesInputGroup,
): Promise<Record<Reference, any>> =>
  // eslint-disable-next-line typescript/no-unsafe-return
  assign(
    {},
    ...(await Promise.all(
      map(properties.model.state.inputs, async (input) => {
        const state = input[SYMBOL_STATE]
        const log = input[SYMBOL_LOG]

        const optionsVariables = filter(values, (value) =>
          includes(value.type === InputType.Option ? state.options : state.variables, value.name),
        )

        const property: any = { model: { log, state }, ...omit(properties, 'model') }

        return {
          [input[SYMBOL_STATE].reference!]: await input[SYMBOL_STATE].reducer(
            [...optionsVariables],
            property,
          ),
        }
      }),
    )),
  )

export const reducer: GenericInputGroupReducer = async (
  values,
  properties,
): Promise<Record<Reference, any>> => await wrap(values, properties)
