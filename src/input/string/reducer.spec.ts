import { assert, describe, it, vi } from 'vitest'
import { command } from '../../command/domain-language'
import { string } from './domain-language'
import { createCompose } from '../../test-utilities/create-compose'

const withRepeat = () => {
  const spy = vi.fn()
  const { compose } = createCompose()

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(
        string()
          .reference('string')
          .description('string')
          .repeat()
          .option('--str')
          .option('-s')
          .variable('STRING')
          .default(['picture']),
      )
      .reducer((values) => {
        spy(values)
      }),
  )

  return { cmd, spy }
}

const withoutRepeat = () => {
  const spy = vi.fn()
  const { compose } = createCompose()

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(
        string()
          .reference('string')
          .description('string')
          .option('--str')
          .option('-s')
          .variable('STRING')
          .default('picture'),
      )
      .reducer((values) => {
        spy(values)
      }),
  )

  return { cmd, spy }
}

describe('input/string/reducer', () => {
  it('...', async () => {
    const { cmd, spy } = withRepeat()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.mock.calls[0][0], {
      string: ['picture'],
    })

    await cmd({
      argv: ['--str', '!', '--str', 'ABC'],
      env: { STRING: 'Hello:World' },
    })

    assert.deepEqual(spy.mock.calls[1][0], {
      string: ['!', 'ABC', 'Hello', 'World'],
    })
  })

  it('...', async () => {
    const { cmd, spy } = withoutRepeat()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.mock.calls[0][0], {
      string: 'picture',
    })

    await cmd({
      argv: [],
      env: { STRING: 'Hello:World' },
    })

    assert.deepEqual(spy.mock.calls[1][0], {
      string: 'Hello:World',
    })
  })
})
