import { composeFactory } from '../compose/compose-factory'

export const compose = composeFactory({
  env: process.env,
  argv: process.argv.slice(2),
  exit: process.exit,
  console
})

export * from '../index'
