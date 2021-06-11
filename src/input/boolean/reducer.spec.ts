/* eslint-disable @typescript-eslint/no-floating-promises */

import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../exports/node-test'
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
      .reducer((values) => {
        spy(values)
      })
  )

  return { spy, cmd }
}

describe('input/boolean/reducer', () => {
  it('input', async () => {
    const { spy, cmd } = factory()

    await cmd({ argv: [], env: {} })

    assert.equal(spy.callCount, 1)

    assert.deepEqual(spy.getCall(0).args[0], {
      bool: false
    })

    await cmd({ argv: ['--yes'], env: {} })

    assert.equal(spy.callCount, 2)

    assert.deepEqual(spy.getCall(1).args[0], {
      bool: true
    })

    await cmd({ argv: [], env: { YES: 'true' } })

    assert.equal(spy.callCount, 3)

    assert.deepEqual(spy.getCall(2).args[0], {
      bool: true
    })

    await cmd({ argv: ['--no'], env: {} })

    assert.equal(spy.callCount, 4)

    assert.deepEqual(spy.getCall(3).args[0], {
      bool: false
    })

    await cmd({ argv: [], env: { NO: 'TRUE' } })

    assert.equal(spy.callCount, 5)

    assert.deepEqual(spy.getCall(4).args[0], {
      bool: false
    })

    await cmd({ argv: [], env: { NO: 'FALSE' } })

    assert.equal(spy.callCount, 6)

    assert.deepEqual(spy.getCall(5).args[0], {
      bool: true
    })
  })

  it('conflict', async () => {
    const { cmd } = factory()
    const message = /conflicting/i

    await assert.isRejected(cmd({ argv: ['--yes', '--no'], env: {} }), message)

    await assert.isRejected(
      cmd({ argv: ['--yes'], env: { NO: 'true' } }),
      message
    )

    await assert.isRejected(
      cmd({ argv: ['--no'], env: { YES: 'true' } }),
      message
    )
  })
})
