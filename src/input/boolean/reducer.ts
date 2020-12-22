import { DefaultInputBooleanReducer } from './types'
import { isEmpty, map, uniq } from 'lodash-es'
import { InputType } from '../../types'
import { message } from '../../utility/message'

const invert = (value: boolean, pass: boolean) => (value ? pass : !pass)
const toBool = (value: string) => /^(yes|y|true|t|on|1)$/i.test(value)

export const reducer: DefaultInputBooleanReducer = (values, props) => {
  if (isEmpty(values)) {
    return props.model.state.default
  } else {
    const product = uniq(
      map(values, (value) =>
        invert(
          value.type === InputType.Option ? value.value : toBool(value.value),
          props.model.state.table[
            value.type === InputType.Option ? 'options' : 'variables'
          ][value.name]
        )
      )
    )

    if (product.length !== 1) {
      throw new Error(`Conflicting input for ${message(values)}`)
    }

    return product[0]
  }
}
