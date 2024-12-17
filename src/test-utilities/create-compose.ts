import { composeFactory } from '../compose/compose-factory'
import { vi } from 'vitest'

export const createCompose = () => {
  const spyExit = vi.fn()
  const spyError = vi.fn()
  const spyLog = vi.fn()

  const compose = composeFactory({
    argv: process.argv.slice(2),
    console: {
      error: spyError,
      log: spyLog,
    },
    env: process.env,
    exit: (code) => {
      spyExit(code)
    },
  })

  return {
    compose,
    spyError,
    spyExit,
    spyLog,
  }
}
