import { log, state, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assert, describe, it } from 'vitest'
import { SYMBOL_INPUT_STRING } from '../../types'
import { string } from './domain-language'
import { reducer } from './reducer'
import { TypeAction } from './types'

describe('input/choice', () => {
  it('domain-language', () => {
    const reference = 'test'

    assert.isFunction(string)

    const test0 = string()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      default: undefined,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference: undefined,
      repeat: false,
      type: SYMBOL_INPUT_STRING,
      variables: [],
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(log(test1), [{ payload: reference, type: TypeAction.Reference }])

    assert.deepEqual(state(test1), {
      default: undefined,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: false,
      type: SYMBOL_INPUT_STRING,
      variables: [],
    })

    const test2 = test1.description('ABC')

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'repeat', 'option', 'variable'])

    assert.deepEqual(log(test2), [
      { payload: 'ABC', type: TypeAction.Description },
      { payload: reference, type: TypeAction.Reference },
    ])

    assert.deepEqual(state(test2), {
      default: undefined,
      description: 'ABC',
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: false,
      type: SYMBOL_INPUT_STRING,
      variables: [],
    })

    const test3 = test2.repeat()

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'variable'])

    assert.deepEqual(log(test3), [
      { payload: undefined, type: TypeAction.Repeat },
      { payload: 'ABC', type: TypeAction.Description },
      { payload: reference, type: TypeAction.Reference },
    ])

    assert.deepEqual(state(test3), {
      default: undefined,
      description: 'ABC',
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_STRING,
      variables: [],
    })

    const test4 = test3.option('--option')

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE, 'default', 'option', 'variable'])

    assert.deepEqual(log(test4), [
      {
        payload: {
          name: '--option',
        },
        type: TypeAction.Option,
      },
      { payload: undefined, type: TypeAction.Repeat },
      { payload: 'ABC', type: TypeAction.Description },
      { payload: reference, type: TypeAction.Reference },
    ])

    assert.deepEqual(state(test4), {
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_STRING,
      variables: [],
    })

    const test5 = test4.variable('VARIABLE')

    assert.hasAllKeys(test5, [SYMBOL_LOG, SYMBOL_STATE, 'default', 'option', 'variable'])

    assert.deepEqual(log(test5), [
      {
        payload: 'VARIABLE',
        type: TypeAction.Variable,
      },
      {
        payload: {
          name: '--option',
        },
        type: TypeAction.Option,
      },
      { payload: undefined, type: TypeAction.Repeat },
      { payload: 'ABC', type: TypeAction.Description },
      { payload: reference, type: TypeAction.Reference },
    ])

    assert.deepEqual(state(test5), {
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_STRING,
      variables: ['VARIABLE'],
    })

    const test6 = test5.default(['A', 'B', 'C'])

    assert.hasAllKeys(test6, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test6), [
      { payload: ['A', 'B', 'C'], type: TypeAction.Default },
      {
        payload: 'VARIABLE',
        type: TypeAction.Variable,
      },
      {
        payload: {
          name: '--option',
        },
        type: TypeAction.Option,
      },
      { payload: undefined, type: TypeAction.Repeat },
      { payload: 'ABC', type: TypeAction.Description },
      { payload: reference, type: TypeAction.Reference },
    ])

    assert.deepEqual(state(test6), {
      default: ['A', 'B', 'C'],
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_STRING,
      variables: ['VARIABLE'],
    })
  })
})
