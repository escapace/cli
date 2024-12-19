import { assert, describe, it, vi } from 'vitest'
import { command } from '../../command/domain-language'
import { createCompose } from '../../test-utilities/create-compose'
import { number } from './domain-language'

const withRepeat = () => {
  const spy = vi.fn()
  const { compose, ...spies } = createCompose()

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(
        number()
          .reference('number')
          .description('number')
          .repeat()
          .option('--nbr')
          .option('-n')
          .variable('NUMBER')
          .default([50, 100]),
      )
      .reducer((values) => {
        spy(values)
      }),
  )

  return { cmd, spy, ...spies }
}

const withoutRepeat = () => {
  const spy = vi.fn()
  const { compose, ...spies } = createCompose()

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(
        number()
          .reference('number')
          .description('number')
          .option('-n')
          .option('--nbr')
          .variable('NUMBER')
          .default(100),
      )
      .reducer((values) => {
        spy(values)
      }),
  )

  return { cmd, spy, ...spies }
}

describe('input/string/reducer', () => {
  it('...', async () => {
    const { cmd, spy } = withRepeat()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.mock.calls[0][0], {
      number: [50, 100],
    })

    await cmd({
      argv: ['-n', '10', '-n', '20', '-n', '30'],
      env: { NUMBER: '200:300' },
    })

    assert.deepEqual(spy.mock.calls[1][0], {
      number: [10, 20, 30, 200, 300],
    })
  })

  it('...', async () => {
    const { cmd, spy } = withoutRepeat()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.mock.calls[0][0], {
      number: 100,
    })

    await cmd({
      argv: [],
      env: { NUMBER: ' 400 ' },
    })

    assert.deepEqual(spy.mock.calls[1][0], {
      number: 400,
    })
  })

  it('...', async () => {
    const { cmd, spy, spyExit } = withoutRepeat()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.mock.calls[0][0], {
      number: 100,
    })

    await cmd({
      argv: ['-n', 'bla'],
    })

    assert.deepEqual(spyExit.mock.calls[0], [1])
    assert.equal(spyExit.mock.calls.length, 1)

    // assert.deepEqual(spy.mock.calls[1][0], {
    //   number: 400,
    // })
  })
})
