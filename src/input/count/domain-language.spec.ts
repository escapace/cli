import { log, state, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assert, describe, it } from 'vitest'
import { SYMBOL_INPUT_COUNT } from '../../types'
import { count } from './domain-language'
import { reducer } from './reducer'
import { InputCountTypeAction } from './types'

describe('input/count', () => {
  it('domain-language', () => {
    const reference = 'test'

    assert.isFunction(count)

    const test0 = count()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      default: 0,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference: undefined,
      table: {},
      type: SYMBOL_INPUT_COUNT,
      variables: [],
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(state(test1), {
      default: 0,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference,
      table: {},
      type: SYMBOL_INPUT_COUNT,
      variables: [],
    })

    assert.deepEqual(log(test1), [{ payload: reference, type: InputCountTypeAction.Reference }])

    const test2 = test1.description('ABC')

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'option'])

    assert.deepEqual(state(test2), {
      default: 0,
      description: 'ABC',
      isEmpty: true,
      options: [],
      reducer,
      reference,
      table: {},
      type: SYMBOL_INPUT_COUNT,
      variables: [],
    })

    assert.deepEqual(log(test2), [
      { payload: 'ABC', type: InputCountTypeAction.Description },
      { payload: reference, type: InputCountTypeAction.Reference },
    ])

    const test3 = test2.option('-v', '-q')

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'default'])

    assert.deepEqual(state(test3), {
      default: 0,
      description: 'ABC',
      isEmpty: false,
      options: ['-v', '-q'],
      reducer,
      reference,
      table: { '-q': -1, '-v': 1 },
      type: SYMBOL_INPUT_COUNT,
      variables: [],
    })

    assert.deepEqual(log(test3), [
      {
        payload: {
          decrease: '-q',
          increase: '-v',
        },
        type: InputCountTypeAction.Option,
      },
      { payload: 'ABC', type: InputCountTypeAction.Description },
      { payload: reference, type: InputCountTypeAction.Reference },
    ])

    const test4 = test3.default(10)

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(state(test4), {
      default: 10,
      description: 'ABC',
      isEmpty: false,
      options: ['-v', '-q'],
      reducer,
      reference,
      table: { '-q': -1, '-v': 1 },
      type: SYMBOL_INPUT_COUNT,
      variables: [],
    })

    assert.deepEqual(log(test4), [
      { payload: 10, type: InputCountTypeAction.Default },
      {
        payload: {
          decrease: '-q',
          increase: '-v',
        },
        type: InputCountTypeAction.Option,
      },
      { payload: 'ABC', type: InputCountTypeAction.Description },
      { payload: reference, type: InputCountTypeAction.Reference },
    ])
  })
})
