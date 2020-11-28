/* eslint-disable @typescript-eslint/no-floating-promises */

import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../command/compose'
import { command } from '../../command/domain-language'
import { choice } from './domain-language'

chai.use(promised)

const factory = (repeat = true) => {
  const spy = Spy()

  const parent = choice()
    .reference('choice')
    .description('choice')
    .choices('AA', 'BB', 'CC', 'DD')
    .option('--choice')
    .option('-c')
    .variable('CHOICE')

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(repeat ? parent.repeat().default(['DD']) : parent)
      .reducer((values, model) => {
        assert.isArray(model.log)
        assert.isObject(model.state)

        spy(values)
      })
  )

  return { spy, cmd }
}

describe('input/choice/reducer', () => {
  it('input', async () => {
    const { spy, cmd } = factory()

    await cmd({ argv: ['command'], env: {} })

    assert.equal(spy.callCount, 1)

    assert.deepEqual(spy.getCall(0).args[0], {
      _: [],
      choice: ['DD']
    })

    await cmd({ argv: ['command', '-c', 'CC'], env: { CHOICE: 'AA:BB' } })

    assert.equal(spy.callCount, 2)

    assert.deepEqual(spy.getCall(1).args[0], {
      _: [],
      choice: ['CC', 'AA', 'BB']
    })
  })

  it('unexpected input', async () => {
    const { cmd } = factory()

    await assert.isRejected(
      cmd({
        argv: ['command', '-c', 'FF', '--choice', 'QQ'],
        env: { CHOICE: 'ZZ:XX' }
      }),
      /unexpected input/i
    )
  })

  it('conflict', async () => {
    const { cmd } = factory(false)

    await assert.isRejected(
      cmd({
        argv: ['command'],
        env: { CHOICE: 'CC:DD' }
      }),
      /unexpected input/i
    )

    await assert.isRejected(
      cmd({
        argv: ['command', '-c', 'DD', '-c', 'AA'],
        env: { CHOICE: 'CC' }
      }),
      /conflicting input/i
    )
  })
})
