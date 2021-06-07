/* eslint-disable @typescript-eslint/no-floating-promises */

import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../compose/compose'
import { command } from '../../command/domain-language'
import { count } from './domain-language'

chai.use(promised)

const factory = () => {
  const spy = Spy()

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
          .default(2)
      )
      .reducer((values) => {
        spy(values)
      })
  )

  return { spy, cmd }
}

describe('input/count/reducer', () => {
  it('input', async () => {
    const { spy, cmd } = factory()

    await cmd({ argv: [], env: {} })

    assert.equal(spy.callCount, 1)

    assert.deepEqual(spy.getCall(0).args[0], {
      count: 2
    })

    await cmd({ argv: ['-vv', '--quiet', '-v'], env: {} })

    assert.equal(spy.callCount, 2)

    assert.deepEqual(spy.getCall(1).args[0], {
      count: 2
    })
  })
})
