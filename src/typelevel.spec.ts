/* eslint-disable @typescript-eslint/no-floating-promises */

import $ from '@escapace/typelevel'
import chai, { assert } from 'chai'
import promised from 'chai-as-promised'
import { spy as Spy } from 'sinon'
import { compose } from './compose'
import { command } from './command/domain-language'
import { group } from './input/group/domain-language'
import { boolean } from './input/boolean/domain-language'
import { choice } from './input/choice/domain-language'
import { string } from './input/string/domain-language'
import { noop } from 'lodash'
import { InputType } from './types'

chai.use(promised)

enum Case {
  One,
  Two
}

const factory = (mode: Case = Case.One) => {
  const spy = Spy()

  const inputChoice = choice()
    .reference('choice')
    .description('choice')
    .choices('A', 'B', 'C')
    .repeat()
    .option('-c')
    .option('--choice')
    .default(['A'])

  const inputBoolean = boolean()
    .reference('boolean')
    .description('boolean')
    .option('--bool')
    .option('-b')
    .variable('BOOLEAN')

  const inputStringA = string()
    .reference('string')
    .description('string')
    .repeat()
    .option('-s')
    .option('--string')

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const inputStringB = inputStringA.reducer((value) => {
    const test: $.Equal<
      typeof value,
      Array<{
        type: InputType.Option
        name: '-s' | '--string'
        value: string
      }>
    > = '1'

    spy(value)

    noop(test)

    return Promise.resolve(123 as const)
  })

  const base = group()
    .reference('groupChild')
    .description('group child')
    .input(mode === Case.One ? inputStringA : inputStringB)

  const groupChildA = base.input(inputBoolean)

  const groupChildB = base.input(inputChoice).reducer(async (value) => {
    const testKeys: $.Equal<keyof typeof value, 'choice' | 'string'> = '1'
    const testChoice: $.Equal<typeof value['choice'], Array<'A' | 'B' | 'C'>> =
      '1'
    const testString: $.Equal<typeof value['string'], string[] | 123> = '1'

    noop(testKeys, testChoice, testString)

    spy(value)

    return Promise.resolve(Promise.resolve(value))
  })

  const groupUnion = group()
    .reference('groupUnion')
    .description('group parent')
    .input(mode === Case.One ? groupChildA : groupChildB)
    .reducer((value) => {
      const testKeys: $.Equal<keyof typeof value['groupChild'], 'string'> = '1'
      const testString: $.Equal<
        typeof value['groupChild']['string'],
        string[] | 123
      > = '1'

      spy(value)

      noop(testKeys, testString)

      return value
    })

  const commandA = command()
    .reference('commandA')
    .name('command-a')
    .description('command A')
    .input(groupChildA)
    .reducer((value) => {
      spy(value)

      return value
    })

  const commandB = command()
    .reference('commandB')
    .name('command-b')
    .description('command B')
    .input(groupChildB)
    .reducer((value) => {
      spy(value)

      return value
    })

  const commandC = command()
    .reference('commandC')
    .name('command-c')
    .description('command C')
    .input(groupUnion)
    .reducer((value) => {
      spy(value)

      return value
    })

  const cmd = compose(
    command()
      .reference('cmd')
      .name('command')
      .description('command')
      .subcommand(mode === Case.One ? commandA : commandB)
      .subcommand(commandC)
      .reducer((values) => {
        spy(values)

        if (values.reference === 'commandA') {
          const value = values.value

          const testArg: $.Equal<typeof value['_'], string[]> = '1'
          const testKeys: $.Equal<
            keyof typeof value['groupChild'],
            'string' | 'boolean'
          > = '1'
          const testString: $.Equal<
            typeof value['groupChild']['string'],
            string[] | 123
          > = '1'
          const testBoolean: $.Equal<
            typeof value['groupChild']['boolean'],
            undefined | boolean
          > = '1'

          noop(testArg, testKeys, testString, testBoolean)
        } else if (values.reference === 'commandB') {
          const value = values.value

          const testArg: $.Equal<typeof value['_'], string[]> = '1'
          const testKeys: $.Equal<
            keyof typeof value['groupChild'],
            'choice' | 'string'
          > = '1'
          const testChoice: $.Equal<
            typeof value['groupChild']['choice'],
            Array<'A' | 'B' | 'C'>
          > = '1'
          const testString: $.Equal<
            typeof value['groupChild']['string'],
            string[] | 123
          > = '1'

          noop(testArg, testKeys, testChoice, testString)
        } else if (values.reference === 'commandC') {
          const value = values.value

          const testArg: $.Equal<typeof value['_'], string[]> = '1'
          const testKeys: $.Equal<
            keyof typeof value['groupUnion']['groupChild'],
            'string'
          > = '1'
          const testString: $.Equal<
            typeof value['groupUnion']['groupChild']['string'],
            string[] | 123
          > = '1'

          noop(testArg, testKeys, testString)
        }
      })
  )

  return { spy, cmd }
}

describe('typelevel', () => {
  it('case one / command-a', async () => {
    const { spy, cmd } = factory(Case.One)

    await cmd({
      argv: ['command-a', '-b', '-s', 'hello', '-s', 'world', 'arg1', 'arg2'],
      env: {}
    })

    assert.equal(spy.callCount, 2)

    assert.deepEqual(spy.getCall(0).args[0], {
      _: ['arg1', 'arg2'],
      groupChild: {
        string: ['hello', 'world'],
        boolean: true
      }
    })

    assert.deepEqual(spy.getCall(1).args[0], {
      reference: 'commandA',
      value: {
        _: ['arg1', 'arg2'],
        groupChild: {
          string: ['hello', 'world'],
          boolean: true
        }
      }
    })
  })

  it('case one / command-c', async () => {
    const { spy, cmd } = factory(Case.One)

    await cmd({
      argv: ['command-c', '-b', '-s', 'hello', '-s', 'world', 'arg1', 'arg2'],
      env: {}
    })

    assert.equal(spy.callCount, 3)

    assert.deepEqual(spy.getCall(0).args[0], {
      groupChild: {
        string: ['hello', 'world'],
        boolean: true
      }
    })

    assert.deepEqual(spy.getCall(1).args[0], {
      _: ['arg1', 'arg2'],
      groupUnion: {
        groupChild: {
          string: ['hello', 'world'],
          boolean: true
        }
      }
    })

    assert.deepEqual(spy.getCall(2).args[0], {
      reference: 'commandC',
      value: {
        _: ['arg1', 'arg2'],
        groupUnion: {
          groupChild: {
            string: ['hello', 'world'],
            boolean: true
          }
        }
      }
    })
  })

  it('case two / command-b', async () => {
    const { spy, cmd } = factory(Case.Two)

    await cmd({
      argv: [
        'command-b',
        '-c',
        'B',
        '-c',
        'C',
        '-s',
        'hello',
        '-s',
        'world',
        'arg1',
        'arg2'
      ],
      env: {}
    })

    assert.equal(spy.callCount, 4)

    assert.deepEqual(spy.getCall(0).args[0], [
      { type: InputType.Option, name: '-s', value: 'hello' },
      { type: InputType.Option, name: '-s', value: 'world' }
    ])

    assert.deepEqual(spy.getCall(1).args[0], {
      choice: ['B', 'C'],
      string: 123
    })

    assert.deepEqual(spy.getCall(2).args[0], {
      _: ['arg1', 'arg2'],
      groupChild: {
        choice: ['B', 'C'],
        string: 123
      }
    })

    assert.deepEqual(spy.getCall(3).args[0], {
      reference: 'commandB',
      value: {
        _: ['arg1', 'arg2'],
        groupChild: {
          choice: ['B', 'C'],
          string: 123
        }
      }
    })
  })

  it('case two / command-c', async () => {
    const { spy, cmd } = factory(Case.Two)

    await cmd({
      argv: [
        'command-c',
        '-c',
        'B',
        '-c',
        'C',
        '-s',
        'hello',
        '-s',
        'world',
        'arg1',
        'arg2'
      ],
      env: {}
    })

    assert.equal(spy.callCount, 5)

    assert.deepEqual(spy.getCall(0).args[0], [
      { type: InputType.Option, name: '-s', value: 'hello' },
      { type: InputType.Option, name: '-s', value: 'world' }
    ])

    assert.deepEqual(spy.getCall(1).args[0], {
      choice: ['B', 'C'],
      string: 123
    })

    assert.deepEqual(spy.getCall(2).args[0], {
      groupChild: {
        choice: ['B', 'C'],
        string: 123
      }
    })

    assert.deepEqual(spy.getCall(3).args[0], {
      _: ['arg1', 'arg2'],
      groupUnion: {
        groupChild: {
          choice: ['B', 'C'],
          string: 123
        }
      }
    })

    assert.deepEqual(spy.getCall(4).args[0], {
      reference: 'commandC',
      value: {
        _: ['arg1', 'arg2'],
        groupUnion: {
          groupChild: {
            choice: ['B', 'C'],
            string: 123
          }
        }
      }
    })
  })
})
