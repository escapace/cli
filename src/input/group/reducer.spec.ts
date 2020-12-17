/* eslint-disable @typescript-eslint/no-floating-promises */

import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../compose'
import { command } from '../../command/domain-language'
import { group } from './domain-language'
import { boolean } from '../boolean/domain-language'
import { choice } from '../choice/domain-language'

chai.use(promised)

enum ModeFactory {
  WithReducer,
  WithoutReducer
}

const factory = (mode: ModeFactory = ModeFactory.WithReducer) => {
  const spy = Spy()

  const inputA = choice()
    .reference('choice')
    .description('choice')
    .option('-c')
    .option('--choice')
    .choices('A', 'B', 'C')
    .repeat()
    .default(['A'])

  const inputB = boolean()
    .reference('boolean')
    .description('boolean')
    .option('--bool')
    .option('-b')
    .variable('BOOLEAN')

  const withoutReducer = group()
    .reference('groupA')
    .description('group a')
    .input(inputA)
    .input(inputB)

  const withReducer = withoutReducer.reducer(async (value) => {
    spy(value)

    return Promise.resolve(Promise.resolve('groupA return' as const))
  })

  const groupB = group()
    .reference('groupB')
    .description('group B')
    .input(mode === ModeFactory.WithReducer ? withReducer : withoutReducer)
    .reducer((value) => {
      spy(value)

      return value
    })

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(groupB)
      .reducer((values) => {
        spy(values)
      })
  )

  return { spy, cmd }
}

describe('input/group/reducer', () => {
  it('default reducer', async () => {
    const { spy, cmd } = factory(ModeFactory.WithoutReducer)

    await cmd({ argv: ['-b', '-c', 'B', '-c', 'C'], env: {} })

    assert.equal(spy.callCount, 2)

    assert.deepEqual(spy.getCall(0).args[0], {
      groupA: {
        boolean: true,
        choice: ['B', 'C']
      }
    })

    assert.deepEqual(spy.getCall(1).args[0], {
      _: [],
      groupB: {
        groupA: {
          boolean: true,
          choice: ['B', 'C']
        }
      }
    })
  })

  it('custom reducer', async () => {
    const { spy, cmd } = factory(ModeFactory.WithReducer)

    await cmd({ argv: ['-b', '-c', 'B', '-c', 'C'], env: {} })

    assert.equal(spy.callCount, 3)

    assert.deepEqual(spy.getCall(0).args[0], {
      boolean: true,
      choice: ['B', 'C']
    })

    assert.deepEqual(spy.getCall(1).args[0], {
      groupA: 'groupA return'
    })

    assert.deepEqual(spy.getCall(2).args[0], {
      _: [],
      groupB: {
        groupA: 'groupA return'
      }
    })
  })
})
