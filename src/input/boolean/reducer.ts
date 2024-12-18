import { filter, isEmpty, map, uniq } from 'lodash-es'
import { InputType } from '../../types'
import type { DefaultInputBooleanReducer } from './types'

const invert = (value: boolean, pass: boolean) => (value ? pass : !pass)
const toBool = (value: string) => /^(?:[1ty]|on|true|yes)$/i.test(value)

export const reducer: DefaultInputBooleanReducer = (values, properties) => {
  const product = uniq(
    filter(
      map(values, (value) =>
        invert(
          value.type === InputType.Option ? value.value : toBool(value.value),
          properties.model.state.table[value.type === InputType.Option ? 'options' : 'variables'][
            value.name
          ],
        ),
      ),
      (value) => value !== undefined,
    ),
  )

  return isEmpty(product) ? properties.model.state.default : product[0]
}
