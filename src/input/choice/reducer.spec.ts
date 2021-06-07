/* eslint-disable @typescript-eslint/no-floating-promises */

import $ from '@escapace/typelevel'
import { noop } from 'lodash-es'
import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from '../../compose/compose'
import { command } from '../../command/domain-language'
import { choice } from './domain-language'

chai.use(promised)

const factory = (repeat = true) => {
  const spy = Spy()

  const base = choice()
    .reference('choice')
    .description('choice')
    .choices('AA', 'BB', 'CC', 'DD')

  const withRepeat = base
    .repeat()
    .option('--choice')
    .option('-c')
    .variable('CHOICE')
    .default(['DD'])

  const withoutRepeat = base.option('--choice').option('-c').variable('CHOICE')

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .input(repeat ? withRepeat : withoutRepeat)
      .reducer((values) => {
        const test: $.Equal<
          typeof values['choice'],
          | 'AA'
          | 'BB'
          | 'CC'
          | 'DD'
          | Array<'AA' | 'BB' | 'CC' | 'DD'>
          | undefined
        > = '1'

        noop(test)

        spy(values)
      })
  )

  return { spy, cmd }
}

describe('input/choice/reducer', () => {
  it('input', async () => {
    const { spy, cmd } = factory()

    await cmd({ argv: [], env: {} })

    assert.equal(spy.callCount, 1)

    assert.deepEqual(spy.getCall(0).args[0], {
      choice: ['DD']
    })

    await cmd({ argv: ['-c', 'CC'], env: { CHOICE: 'AA:BB' } })

    assert.equal(spy.callCount, 2)

    assert.deepEqual(spy.getCall(1).args[0], {
      choice: ['CC', 'AA', 'BB']
    })
  })

  it('unexpected input', async () => {
    const { cmd } = factory()

    await assert.isRejected(
      cmd({
        argv: ['-c', 'FF', '--choice', 'QQ'],
        env: { CHOICE: 'ZZ:XX' }
      }),
      /unexpected input/i
    )
  })

  it('conflict', async () => {
    const { cmd } = factory(false)

    await assert.isRejected(
      cmd({
        argv: [],
        env: { CHOICE: 'CC:DD' }
      }),
      /unexpected input/i
    )

    await assert.isRejected(
      cmd({
        argv: ['-c', 'DD', '-c', 'AA'],
        env: { CHOICE: 'CC' }
      }),
      /conflicting input/i
    )
  })
})
