import { choice } from './domain-language'

import { SYMBOL_LOG, SYMBOL_STATE, log, state } from '@escapace/fluent'
import { assert } from 'chai'
import { SYMBOL_INPUT_CHOICE } from '../../types'
import { TypeAction } from './types'
import { reducer } from './reducer'

describe('input/choice', () => {
  it('domain-language', () => {
    const reference = 'test' as const

    assert.isFunction(choice)

    const test0 = choice()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      type: SYMBOL_INPUT_CHOICE,
      choices: [],
      default: undefined,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference: undefined,
      repeat: false,
      variables: []
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(log(test1), [
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test1), {
      type: SYMBOL_INPUT_CHOICE,
      choices: [],
      default: undefined,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: false,
      variables: []
    })

    const test2 = test1.description('ABC')

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'choices'])

    assert.deepEqual(log(test2), [
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test2), {
      type: SYMBOL_INPUT_CHOICE,
      choices: [],
      default: undefined,
      description: 'ABC',
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: false,
      variables: []
    })

    const test3 = test2.choices('A', 'B')

    assert.hasAllKeys(test3, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'option',
      'repeat',
      'variable'
    ])

    assert.deepEqual(log(test3), [
      { type: TypeAction.Choices, payload: ['A', 'B'] },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test3), {
      type: SYMBOL_INPUT_CHOICE,
      choices: ['A', 'B'],
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: [],
      reducer,
      reference,
      repeat: false,
      variables: []
    })

    const test4 = test3.repeat()

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'variable'])

    assert.deepEqual(log(test4), [
      { type: TypeAction.Repeat, payload: undefined },
      { type: TypeAction.Choices, payload: ['A', 'B'] },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test4), {
      type: SYMBOL_INPUT_CHOICE,
      choices: ['A', 'B'],
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: [],
      reducer,
      reference,
      repeat: true,
      variables: []
    })

    const test5 = test4.option('--option')

    assert.hasAllKeys(test5, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'default',
      'option',
      'variable'
    ])

    assert.deepEqual(log(test5), [
      {
        type: TypeAction.Option,
        payload: {
          name: '--option'
        }
      },
      { type: TypeAction.Repeat, payload: undefined },
      { type: TypeAction.Choices, payload: ['A', 'B'] },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test5), {
      type: SYMBOL_INPUT_CHOICE,
      choices: ['A', 'B'],
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      variables: []
    })

    const split = (value: string) => value.split(':')

    const test6 = test5.variable('VARIABLE', {
      split
    })

    assert.hasAllKeys(test6, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'default',
      'option',
      'variable'
    ])

    assert.deepEqual(log(test6), [
      {
        type: TypeAction.Variable,
        payload: {
          name: 'VARIABLE',
          settings: {
            split
          }
        }
      },
      {
        type: TypeAction.Option,
        payload: {
          name: '--option'
        }
      },
      { type: TypeAction.Repeat, payload: undefined },
      { type: TypeAction.Choices, payload: ['A', 'B'] },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test6), {
      type: SYMBOL_INPUT_CHOICE,
      choices: ['A', 'B'],
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      variables: ['VARIABLE']
    })

    const test7 = test6.default(['B'])

    assert.hasAllKeys(test7, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test7), [
      { type: TypeAction.Default, payload: ['B'] },
      {
        type: TypeAction.Variable,
        payload: {
          name: 'VARIABLE',
          settings: {
            split
          }
        }
      },
      {
        type: TypeAction.Option,
        payload: {
          name: '--option'
        }
      },
      { type: TypeAction.Repeat, payload: undefined },
      { type: TypeAction.Choices, payload: ['A', 'B'] },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test7), {
      type: SYMBOL_INPUT_CHOICE,
      choices: ['A', 'B'],
      default: ['B'],
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      variables: ['VARIABLE']
    })
  })
})
