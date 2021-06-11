import { noop } from 'lodash-es'
import { composeFactory } from '../compose/compose-factory'

export const compose = composeFactory({
  env: process.env,
  argv: process.argv.slice(2),
  exit: noop,
  console
})

export * from '../index'
