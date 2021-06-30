/* eslint-disable @typescript-eslint/no-floating-promises */

import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../exports/node-test'
import { command } from '../../command/domain-language'
import { choice } from './domain-language'

chai.use(promised)

const factory = () => {
  const spy = Spy()

  const base = choice()
    .reference('choice')
    .description('choice')
    .choices('AA', 'BB', 'CC', 'DD')

  const withRepeat = base
    .repeat()
    .option('--choice')
    .option('-c')
    .variable('CHOICE')
    .default(['DD'])

  // const withoutRepeat = base.option('--choice').option('-c').variable('CHOICE')

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(withRepeat)
      .reducer((values) => {
        spy(values)
      })
  )

  return { spy, cmd }
}

describe('input/choice/reducer', () => {
  it('input', async () => {
    const { spy, cmd } = factory()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.getCall(0).args[0], {
      choice: ['DD']
    })

    await cmd({ argv: ['-c', 'CC'], env: { CHOICE: 'AA:BB' } })

    assert.deepEqual(spy.getCall(1).args[0], {
      choice: ['CC', 'AA', 'BB']
    })
  })

  it('unexpected input', async () => {
    const { cmd } = factory()

    await assert.isRejected(
      cmd({
        argv: ['-c', 'FF', '--choice', 'QQ'],
        env: { CHOICE: 'ZZ:XX' }
      }),
      /unexpected input/i
    )

    await assert.isRejected(
      cmd({
        argv: [],
        env: {},
        configuration: {
          // @ts-expect-error
          choice: ['ZZ']
        }
      }),
      /unexpected input/i
    )
  })

  it('precedence order', async () => {
    const { spy, cmd } = factory()

    await cmd({
      argv: ['-c', 'CC'],
      env: { CHOICE: 'BB' },
      configuration: { choice: ['AA'] }
    })

    assert.deepEqual(spy.getCall(0).args[0], {
      choice: ['CC', 'BB', 'AA']
    })
  })
})
