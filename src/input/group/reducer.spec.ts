/* eslint-disable @typescript-eslint/no-floating-promises */

import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../exports/node-test'
import { command } from '../../command/domain-language'
import { group } from './domain-language'
import { boolean } from '../boolean/domain-language'
import { choice } from '../choice/domain-language'

chai.use(promised)

const factory = () => {
  const spy = Spy()

  const inputA = choice()
    .reference('choice')
    .description('choice')
    .choices('A', 'B', 'C')
    .repeat()
    .option('-c')
    .option('--choice')
    .default(['A'])

  const inputB = boolean()
    .reference('boolean')
    .description('boolean')
    .option('--bool')
    .option('-b')
    .variable('BOOLEAN')

  const groupA = group()
    .reference('groupA')
    .description('group a')
    .input(inputA)
    .input(inputB)
    .reducer(async (value) => {
      spy(value)

      return Promise.resolve(Promise.resolve('groupA return' as const))
    })

  const groupB = group()
    .reference('groupB')
    .description('group B')
    .input(groupA)

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
  it('...', async () => {
    const { spy, cmd } = factory()

    await cmd({
      argv: ['-c', 'B', '-c', 'A'],
      env: { BOOLEAN: 'yes' },
      configuration: { groupB: { groupA: { choice: ['C'] } } }
    })

    assert.equal(spy.callCount, 2)

    assert.deepEqual(spy.getCall(0).args[0], {
      boolean: true,
      choice: ['B', 'A', 'C']
    })

    assert.deepEqual(spy.getCall(1).args[0], {
      groupB: {
        groupA: 'groupA return'
      }
    })
  })
})
