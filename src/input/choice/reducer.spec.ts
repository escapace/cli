import { assert, describe, it, vi } from 'vitest'
import { createCompose } from '../../exports/node-test'
import { command } from '../../command/domain-language'
import { choice } from './domain-language'

const factory = () => {
  const spy = vi.fn()

  const base = choice().reference('choice').description('choice').choices('AA', 'BB', 'CC', 'DD')

  const withRepeat = base
    .repeat()
    .option('--choice')
    .option('-c')
    .variable('CHOICE')
    .default(['DD'])

  // const withoutRepeat = base.option('--choice').option('-c').variable('CHOICE')

  const { compose, ...spies } = createCompose()

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(withRepeat)
      .reducer((values) => {
        spy(values)
      }),
  )

  return { cmd, spy, ...spies }
}

describe('input/choice/reducer', () => {
  it('input', async () => {
    const { cmd, spy } = factory()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.mock.calls[0][0], {
      choice: ['DD'],
    })

    await cmd({ argv: ['-c', 'CC'], env: { CHOICE: 'AA:BB' } })

    assert.deepEqual(spy.mock.calls[1][0], {
      choice: ['CC', 'AA', 'BB'],
    })
  })

  it('unexpected input', async () => {
    const { cmd, spyExit } = factory()

    await cmd({
      argv: ['-c', 'FF', '--choice', 'QQ'],
      env: { CHOICE: 'ZZ:XX' },
    })

    assert.deepEqual(spyExit.mock.calls[0], [1])
    assert.equal(spyExit.mock.calls.length, 1)
  })

  it('precedence order', async () => {
    const { cmd, spy } = factory()

    await cmd({
      argv: ['-c', 'CC', '-c', 'AA'],
      env: { CHOICE: 'BB' },
    })

    assert.deepEqual(spy.mock.calls[0][0], {
      choice: ['CC', 'AA', 'BB'],
    })
  })
})
