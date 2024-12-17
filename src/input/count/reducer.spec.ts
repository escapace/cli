import { assert, describe, it, vi } from 'vitest'
import { command } from '../../command/domain-language'
import { createCompose } from '../../exports/node-test'
import { count } from './domain-language'

const factory = () => {
  const spy = vi.fn()
  const { compose } = createCompose()

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(
        count()
          .reference('count')
          .description('count')
          .option(undefined, '--quiet')
          .option('-v', '-q')
          .default(2),
      )
      .reducer((values) => {
        spy(values)
      }),
  )

  return { cmd, spy }
}

describe('input/count/reducer', () => {
  it('input', async () => {
    const { cmd, spy } = factory()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.mock.calls[0][0], {
      count: 2,
    })

    await cmd({ argv: ['-vv', '--quiet', '-v'], env: {} })

    assert.deepEqual(spy.mock.calls[1][0], {
      count: 2,
    })
  })
})
