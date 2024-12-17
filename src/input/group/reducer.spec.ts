import { assert, describe, it, vi } from 'vitest'
import { createCompose } from '../../exports/node-test'
import { command } from '../../command/domain-language'
import { group } from './domain-language'
import { boolean } from '../boolean/domain-language'
import { choice } from '../choice/domain-language'

const factory = () => {
  const spy = vi.fn()

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

      return await Promise.resolve(Promise.resolve('groupA return' as const))
    })

  const groupB = group().reference('groupB').description('group B').input(groupA)

  const { compose } = createCompose()

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(groupB)
      .reducer((values) => {
        spy(values)
      }),
  )

  return { cmd, spy }
}

describe('input/group/reducer', () => {
  it('...', async () => {
    const { cmd, spy } = factory()

    await cmd({
      argv: ['-c', 'B', '-c', 'A', '-c', 'C'],
      env: { BOOLEAN: 'yes' },
    })

    assert.equal(spy.mock.calls.length, 2)

    assert.deepEqual(spy.mock.calls[0][0], {
      boolean: true,
      choice: ['B', 'A', 'C'],
    })

    assert.deepEqual(spy.mock.calls[1][0], {
      groupB: {
        groupA: 'groupA return',
      },
    })
  })
})
