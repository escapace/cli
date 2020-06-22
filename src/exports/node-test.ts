import { composeFactory } from '../compose/compose-factory'
import { spy } from 'sinon'

export const exitSpy = spy()
export const log = spy()
export const error = spy()

export const compose = composeFactory({
  env: process.env,
  argv: process.argv.slice(2),
  exit: (code) => {
    exitSpy(code)
  },
  console: {
    log,
    error
  }
})

export * from '../index'
