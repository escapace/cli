/* eslint-disable @typescript-eslint/no-floating-promises */

import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../exports/node-test'
import { command } from '../../command/domain-language'
import { string } from './domain-language'

chai.use(promised)

const withRepeat = () => {
  const spy = Spy()

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
          .default(['picture'])
      )
      .reducer((values) => {
        spy(values)
      })
  )

  return { spy, cmd }
}

const withoutRepeat = () => {
  const spy = Spy()

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
          .default('picture')
      )
      .reducer((values) => {
        spy(values)
      })
  )

  return { spy, cmd }
}

describe('input/string/reducer', () => {
  it('...', async () => {
    const { spy, cmd } = withRepeat()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.getCall(0).args[0], {
      string: ['picture']
    })

    await cmd({
      argv: ['--str', '!'],
      env: { STRING: 'Hello:World' },
      configuration: {
        string: ['ABC']
      }
    })

    assert.deepEqual(spy.getCall(1).args[0], {
      string: ['!', 'Hello', 'World', 'ABC']
    })
  })

  it('...', async () => {
    const { spy, cmd } = withoutRepeat()

    await cmd({ argv: [], env: {} })

    assert.deepEqual(spy.getCall(0).args[0], {
      string: 'picture'
    })

    await cmd({
      argv: [],
      env: { STRING: 'Hello:World' },
      configuration: {
        string: 'ABC'
      }
    })

    assert.deepEqual(spy.getCall(1).args[0], {
      string: 'Hello:World'
    })
  })
})
