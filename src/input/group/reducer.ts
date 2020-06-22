/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import {
  assign,
  compact,
  filter,
  get,
  includes,
  isPlainObject,
  map,
  omit
} from 'lodash-es'
import {
  GenericConfiguration,
  GenericOption,
  GenericVariable,
  InputType,
  Reference
} from './../../types'
import { GenericInputGroupReducer, PropsInputGroup } from './types'

export const wrap = async (
  values: Array<
    GenericOption<any> | GenericVariable<any> | GenericConfiguration<any>
  >,
  props: PropsInputGroup
): Promise<Record<Reference, any>> => {
  const previousConfiguration = filter(
    values,
    (value) => value.type === InputType.Configuration && isPlainObject(value)
  ) as Array<GenericConfiguration<any>>

  return assign(
    {},
    ...(await Promise.all(
      map(props.model.state.inputs, async (input) => {
        const state = input[SYMBOL_STATE]
        const log = input[SYMBOL_LOG]

        const nextConfiguration = compact(
          map(previousConfiguration, (previousValue) => {
            const value = get(previousValue.value, [state.reference!])

            return value === undefined
              ? undefined
              : {
                  type: InputType.Configuration,
                  name: [...previousValue.name, state.reference!],
                  value
                }
          })
        )

        const optionsVariables = filter(
          values,
          (value) =>
            value.type !== InputType.Configuration &&
            includes(
              value.type === InputType.Option ? state.options : state.variables,
              value.name
            )
        )

        const prop: any = { model: { state, log }, ...omit(props, 'model') }

        return {
          [input[SYMBOL_STATE].reference as Reference]: await input[
            SYMBOL_STATE
          ].reducer([...optionsVariables, ...nextConfiguration], prop)
        }
      })
    ))
  )
}

export const reducer: GenericInputGroupReducer = async (
  values,
  props
): Promise<Record<Reference, any>> => wrap(values, props)
