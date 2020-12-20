/* eslint-disable @typescript-eslint/no-floating-promises */

import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../compose'
import { command } from '../../command/domain-language'
import { string } from './domain-language'

chai.use(promised)

enum ModeFactory {
  Default,
  Repeat,
  Reducer
}

const factory = (mode: ModeFactory = ModeFactory.Default) => {
  const spy = Spy()

  const parent = string()
    .reference('string')
    .description('string')
    .option('--str')
    .option('-s')
    .variable('STRING')

  // TODO: default doesn't make sense with reducer
  const withRepeat = parent.repeat().default(['Yay'])

  const withReducer = parent.repeat().reducer((values, model) => {
    assert.isArray(model.log)
    assert.isObject(model.state)

    spy(values)

    return values
  })

  const choice = {
    [ModeFactory.Default]: parent,
    [ModeFactory.Repeat]: withRepeat,
    [ModeFactory.Reducer]: withReducer
  }[mode]

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(choice)
      .reducer((values, model) => {
        assert.isArray(model.log)
        assert.isObject(model.state)

        spy(values)
      })
  )

  return { spy, cmd }
}

describe('input/string/reducer', () => {
  it('repeat', async () => {
    const { spy, cmd } = factory(ModeFactory.Repeat)

    await cmd({ argv: [], env: {} })

    assert.equal(spy.callCount, 1)

    assert.deepEqual(spy.getCall(0).args[0], {
      _: [],
      string: ['Yay']
    })

    await cmd({
      argv: ['--str', '!'],
      env: { STRING: 'Hello:World' }
    })

    assert.equal(spy.callCount, 2)

    assert.deepEqual(spy.getCall(1).args[0], {
      _: [],
      string: ['!', 'Hello', 'World']
    })
  })

  it('default', async () => {
    const { spy, cmd } = factory()

    await cmd({ argv: [], env: { STRING: 'hello:world' } })

    assert.equal(spy.callCount, 1)

    assert.deepEqual(spy.getCall(0).args[0], {
      _: [],
      string: 'hello:world'
    })
  })

  it('conflict', async () => {
    const { cmd } = factory()

    await assert.isRejected(
      cmd({
        argv: ['-s', 'Hello'],
        env: { STRING: 'World' }
      }),
      /conflicting input/i
    )
  })

  it('custom', async () => {
    const { spy, cmd } = factory(ModeFactory.Reducer)

    await cmd({
      argv: ['-s', 'abc', '--str', 'zxc'],
      env: { STRING: 'hello:world' }
    })

    assert.equal(spy.callCount, 2)

    const value = [
      {
        name: '-s',
        type: 0,
        value: 'abc'
      },
      {
        name: '--str',
        type: 0,
        value: 'zxc'
      },
      {
        name: 'STRING',
        type: 1,
        value: 'hello'
      },
      {
        name: 'STRING',
        type: 1,
        value: 'world'
      }
    ]

    assert.deepEqual(spy.getCall(0).args[0], value)

    assert.deepEqual(spy.getCall(1).args[0], {
      _: [],
      string: value
    })
  })
})
