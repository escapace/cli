/* eslint-disable typescript/no-unsafe-argument */
/* eslint-disable typescript/no-unsafe-assignment */
/* eslint-disable typescript/no-non-null-assertion */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assign, compact, filter, get, includes, isPlainObject, map, omit } from 'lodash-es'
import {
  type GenericConfiguration,
  type GenericOption,
  type GenericVariable,
  InputType,
  type Reference,
} from './../../types'
import type { GenericInputGroupReducer, PropertiesInputGroup } from './types'

export const wrap = async (
  values: Array<GenericConfiguration<any> | GenericOption<any> | GenericVariable<any>>,
  properties: PropertiesInputGroup,
): Promise<Record<Reference, any>> => {
  const previousConfiguration = filter(
    values,
    (value) => value.type === InputType.Configuration && isPlainObject(value),
  ) as Array<GenericConfiguration<any>>

  // eslint-disable-next-line typescript/no-unsafe-return
  return assign(
    {},
    ...(await Promise.all(
      map(properties.model.state.inputs, async (input) => {
        const state = input[SYMBOL_STATE]
        const log = input[SYMBOL_LOG]

        const nextConfiguration = compact(
          map(previousConfiguration, (previousValue) => {
            const value = get(previousValue.value, [state.reference!])

            return value === undefined
              ? undefined
              : {
                  name: [...previousValue.name, state.reference!],
                  type: InputType.Configuration,
                  value,
                }
          }),
        )

        const optionsVariables = filter(
          values,
          (value) =>
            value.type !== InputType.Configuration &&
            includes(value.type === InputType.Option ? state.options : state.variables, value.name),
        )

        const property: any = { model: { log, state }, ...omit(properties, 'model') }

        return {
          [input[SYMBOL_STATE].reference!]: await input[SYMBOL_STATE].reducer(
            [...optionsVariables, ...nextConfiguration],
            property,
          ),
        }
      }),
    )),
  )
}

export const reducer: GenericInputGroupReducer = async (
  values,
  properties,
): Promise<Record<Reference, any>> => await wrap(values, properties)
