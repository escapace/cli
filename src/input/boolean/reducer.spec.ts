import { assert, describe, it, vi } from 'vitest'
import { createCompose } from '../../exports/node-test'
import { command } from '../../command/domain-language'
import { boolean } from './domain-language'

const factory = () => {
  const spy = vi.fn()

  const { compose } = createCompose()

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(
        boolean()
          .reference('bool')
          .description('boolean')
          .option('--yes', '--no')
          .variable('YES', 'NO')
          .default(false),
      )
      .reducer((values) => {
        spy(values)
      }),
  )

  return { cmd, spy }
}

describe('input/boolean/reducer', () => {
  it('input', async () => {
    const { cmd, spy } = factory()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.mock.calls[0][0], {
      bool: false,
    })

    await cmd({ argv: ['--yes'], env: {} })

    assert.deepEqual(spy.mock.calls[1][0], {
      bool: true,
    })

    await cmd({ argv: [], env: { YES: 'true' } })

    assert.deepEqual(spy.mock.calls[2][0], {
      bool: true,
    })

    await cmd({ argv: ['--no'], env: {} })

    assert.deepEqual(spy.mock.calls[3][0], {
      bool: false,
    })

    await cmd({ argv: [], env: { NO: 'TRUE' } })

    assert.deepEqual(spy.mock.calls[4][0], {
      bool: false,
    })

    await cmd({ argv: [], env: { NO: 'FALSE' } })

    assert.deepEqual(spy.mock.calls[5][0], {
      bool: true,
    })
  })

  it('precedence order', async () => {
    const { cmd, spy } = factory()

    await cmd({
      argv: [],
      env: { YES: 'false' },
    })

    assert.deepEqual(spy.mock.calls[0][0], {
      bool: false,
    })

    await cmd({
      argv: ['--yes'],
      env: { YES: 'false' },
    })

    assert.deepEqual(spy.mock.calls[1][0], {
      bool: true,
    })
  })
})
