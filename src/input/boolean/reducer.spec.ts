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

    assert.deepEqual(spy.getCall(0).args[0], {
      bool: false
    })

    await cmd({ argv: ['--yes'], env: {} })

    assert.deepEqual(spy.getCall(1).args[0], {
      bool: true
    })

    await cmd({ argv: [], env: { YES: 'true' } })

    assert.deepEqual(spy.getCall(2).args[0], {
      bool: true
    })

    await cmd({ argv: ['--no'], env: {} })

    assert.deepEqual(spy.getCall(3).args[0], {
      bool: false
    })

    await cmd({ argv: [], env: { NO: 'TRUE' } })

    assert.deepEqual(spy.getCall(4).args[0], {
      bool: false
    })

    await cmd({ argv: [], env: { NO: 'FALSE' } })

    assert.deepEqual(spy.getCall(5).args[0], {
      bool: true
    })

    await cmd({ argv: [], env: {}, configuration: { bool: true } })

    assert.deepEqual(spy.getCall(6).args[0], {
      bool: true
    })
  })

  it('precedence order', async () => {
    const { spy, cmd } = factory()

    await cmd({
      argv: [],
      env: { YES: 'false' },
      configuration: { bool: true }
    })

    assert.deepEqual(spy.getCall(0).args[0], {
      bool: false
    })

    await cmd({
      argv: ['--yes'],
      env: { YES: 'false' },
      configuration: { bool: true }
    })

    assert.deepEqual(spy.getCall(1).args[0], {
      bool: true
    })
  })
})
