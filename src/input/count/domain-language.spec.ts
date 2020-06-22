import { count } from './domain-language'

import { SYMBOL_LOG, SYMBOL_STATE, log, state } from '@escapace/fluent'
import { assert } from 'chai'
import { SYMBOL_INPUT_COUNT } from '../../types'
import { TypeAction } from './types'
import { reducer } from './reducer'

describe('input/count', () => {
  it('domain-language', () => {
    const reference = 'test' as const

    assert.isFunction(count)

    const test0 = count()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      type: SYMBOL_INPUT_COUNT,
      default: 0,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      table: {},
      reference: undefined,
      variables: []
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(state(test1), {
      type: SYMBOL_INPUT_COUNT,
      default: 0,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      table: {},
      reference,
      variables: []
    })

    assert.deepEqual(log(test1), [
      { type: TypeAction.Reference, payload: reference }
    ])

    const test2 = test1.description('ABC')

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'option'])

    assert.deepEqual(state(test2), {
      type: SYMBOL_INPUT_COUNT,
      default: 0,
      description: 'ABC',
      isEmpty: true,
      options: [],
      reducer,
      table: {},
      reference,
      variables: []
    })

    assert.deepEqual(log(test2), [
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    const test3 = test2.option('-v', '-q')

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'default'])

    assert.deepEqual(state(test3), {
      type: SYMBOL_INPUT_COUNT,
      default: 0,
      description: 'ABC',
      isEmpty: false,
      options: ['-v', '-q'],
      reducer,
      table: { '-v': 1, '-q': -1 },
      reference,
      variables: []
    })

    assert.deepEqual(log(test3), [
      {
        type: TypeAction.Option,
        payload: {
          increase: '-v',
          decrease: '-q'
        }
      },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    const test4 = test3.default(10)

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(state(test4), {
      type: SYMBOL_INPUT_COUNT,
      default: 10,
      description: 'ABC',
      isEmpty: false,
      options: ['-v', '-q'],
      reducer,
      table: { '-v': 1, '-q': -1 },
      reference,
      variables: []
    })

    assert.deepEqual(log(test4), [
      { type: TypeAction.Default, payload: 10 },
      {
        type: TypeAction.Option,
        payload: {
          increase: '-v',
          decrease: '-q'
        }
      },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])
  })
})
