import { noop } from 'lodash-es'
import { composeFactory } from '../compose/compose-factory'

export const compose = composeFactory({
  env: {},
  argv: [],
  exit: noop,
  console
})

export * from '../index'
