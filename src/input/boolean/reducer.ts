import { DefaultInputBooleanReducer } from './types'
import { filter, isEmpty, map, uniq } from 'lodash-es'
import { InputType } from '../../types'
import { assert } from '../../utility/assert'

const invert = (value: boolean, pass: boolean) => (value ? pass : !pass)
const toBool = (value: string) => /^(yes|y|true|t|on|1)$/i.test(value)

export const reducer: DefaultInputBooleanReducer = (values, props) => {
  const product = uniq(
    filter(
      map(values, (value) => {
        if (value.type === InputType.Configuration) {
          assert.boolean(value.value)

          return value.value
        } else {
          return invert(
            value.type === InputType.Option ? value.value : toBool(value.value),
            props.model.state.table[
              value.type === InputType.Option ? 'options' : 'variables'
            ][value.name]
          )
        }
      }),
      (value) => value !== undefined
    )
  )

  return isEmpty(product) ? props.model.state.default : product[0]
}
