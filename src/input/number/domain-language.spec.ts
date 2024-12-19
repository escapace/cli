import { log, state, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assert, describe, it } from 'vitest'
import { SYMBOL_INPUT_NUMBER } from '../../types'
import { number } from './domain-language'
import { reducer } from './reducer'
import { InputNumberTypeAction } from './types'

describe('input/number', () => {
  it('domain-language', () => {
    const reference = 'test'

    assert.isFunction(number)

    const test0 = number()

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
      type: SYMBOL_INPUT_NUMBER,
      variables: [],
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(log(test1), [{ payload: reference, type: InputNumberTypeAction.Reference }])

    assert.deepEqual(state(test1), {
      default: undefined,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: false,
      type: SYMBOL_INPUT_NUMBER,
      variables: [],
    })

    const test2 = test1.description('ABC')

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'repeat', 'option', 'variable'])

    assert.deepEqual(log(test2), [
      { payload: 'ABC', type: InputNumberTypeAction.Description },
      { payload: reference, type: InputNumberTypeAction.Reference },
    ])

    assert.deepEqual(state(test2), {
      default: undefined,
      description: 'ABC',
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: false,
      type: SYMBOL_INPUT_NUMBER,
      variables: [],
    })

    const test3 = test2.repeat()

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'variable'])

    assert.deepEqual(log(test3), [
      { payload: undefined, type: InputNumberTypeAction.Repeat },
      { payload: 'ABC', type: InputNumberTypeAction.Description },
      { payload: reference, type: InputNumberTypeAction.Reference },
    ])

    assert.deepEqual(state(test3), {
      default: undefined,
      description: 'ABC',
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_NUMBER,
      variables: [],
    })

    const test4 = test3.option('--option')

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE, 'default', 'option', 'variable'])

    assert.deepEqual(log(test4), [
      {
        payload: {
          name: '--option',
        },
        type: InputNumberTypeAction.Option,
      },
      { payload: undefined, type: InputNumberTypeAction.Repeat },
      { payload: 'ABC', type: InputNumberTypeAction.Description },
      { payload: reference, type: InputNumberTypeAction.Reference },
    ])

    assert.deepEqual(state(test4), {
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_NUMBER,
      variables: [],
    })

    const test5 = test4.variable('VARIABLE')

    assert.hasAllKeys(test5, [SYMBOL_LOG, SYMBOL_STATE, 'default', 'option', 'variable'])

    assert.deepEqual(log(test5), [
      {
        payload: 'VARIABLE',
        type: InputNumberTypeAction.Variable,
      },
      {
        payload: {
          name: '--option',
        },
        type: InputNumberTypeAction.Option,
      },
      { payload: undefined, type: InputNumberTypeAction.Repeat },
      { payload: 'ABC', type: InputNumberTypeAction.Description },
      { payload: reference, type: InputNumberTypeAction.Reference },
    ])

    assert.deepEqual(state(test5), {
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_NUMBER,
      variables: ['VARIABLE'],
    })

    const test6 = test5.default([1, 2, 3])

    assert.hasAllKeys(test6, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test6), [
      { payload: [1, 2, 3], type: InputNumberTypeAction.Default },
      {
        payload: 'VARIABLE',
        type: InputNumberTypeAction.Variable,
      },
      {
        payload: {
          name: '--option',
        },
        type: InputNumberTypeAction.Option,
      },
      { payload: undefined, type: InputNumberTypeAction.Repeat },
      { payload: 'ABC', type: InputNumberTypeAction.Description },
      { payload: reference, type: InputNumberTypeAction.Reference },
    ])

    assert.deepEqual(state(test6), {
      default: [1, 2, 3],
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_NUMBER,
      variables: ['VARIABLE'],
    })
  })
})
