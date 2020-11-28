/* eslint-disable @typescript-eslint/no-floating-promises */

import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../command/compose'
import { command } from '../../command/domain-language'
import { boolean } from './domain-language'

chai.use(promised)

const factory = () => {
  const spy = Spy()

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
          .default(false)
      )
      .reducer((values, model) => {
        assert.isArray(model.log)
        assert.isObject(model.state)

        spy(values)
      })
  )

  return { spy, cmd }
}

describe('input/boolean/reducer', () => {
  it('input', async () => {
    const { spy, cmd } = factory()

    await cmd({ argv: ['command'], env: {} })

    assert.equal(spy.callCount, 1)

    assert.deepEqual(spy.getCall(0).args[0], {
      _: [],
      bool: false
    })

    await cmd({ argv: ['command', '--yes'], env: {} })

    assert.equal(spy.callCount, 2)

    assert.deepEqual(spy.getCall(1).args[0], {
      _: [],
      bool: true
    })

    await cmd({ argv: ['command'], env: { YES: 'true' } })

    assert.equal(spy.callCount, 3)

    assert.deepEqual(spy.getCall(2).args[0], {
      _: [],
      bool: true
    })

    await cmd({ argv: ['command', '--no'], env: {} })

    assert.equal(spy.callCount, 4)

    assert.deepEqual(spy.getCall(3).args[0], {
      _: [],
      bool: false
    })

    await cmd({ argv: ['command'], env: { NO: 'TRUE' } })

    assert.equal(spy.callCount, 5)

    assert.deepEqual(spy.getCall(4).args[0], {
      _: [],
      bool: false
    })

    await cmd({ argv: ['command'], env: { NO: 'FALSE' } })

    assert.equal(spy.callCount, 6)

    assert.deepEqual(spy.getCall(5).args[0], {
      _: [],
      bool: true
    })
  })

  it('conflict', async () => {
    const { cmd } = factory()
    const message = /conflicting/i

    await assert.isRejected(
      cmd({ argv: ['command', '--yes', '--no'], env: {} }),
      message
    )

    await assert.isRejected(
      cmd({ argv: ['command', '--yes'], env: { NO: 'true' } }),
      message
    )

    await assert.isRejected(
      cmd({ argv: ['command', '--no'], env: { YES: 'true' } }),
      message
    )
  })
})
