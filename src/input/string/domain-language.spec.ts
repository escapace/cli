import { log, state, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assert } from 'chai'
import { LookupValues, SYMBOL_INPUT_STRING } from '../../types'
import { string } from './domain-language'
import { reducer } from './reducer'
import { TypeAction } from './types'

describe('input/choice', () => {
  it('domain-language', () => {
    const reference = 'test' as const

    assert.isFunction(string)

    const test0 = string()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      type: SYMBOL_INPUT_STRING,
      default: undefined,
      reducer,
      description: undefined,
      isEmpty: true,
      options: [],
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
      type: SYMBOL_INPUT_STRING,
      default: undefined,
      description: undefined,
      reducer,
      isEmpty: true,
      options: [],
      reference,
      repeat: false,
      variables: []
    })

    const test2 = test1.description('ABC')

    assert.hasAllKeys(test2, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'repeat',
      'option',
      'variable'
    ])

    assert.deepEqual(log(test2), [
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test2), {
      type: SYMBOL_INPUT_STRING,
      default: undefined,
      description: 'ABC',
      reducer,
      isEmpty: true,
      options: [],
      reference,
      repeat: false,
      variables: []
    })

    const test3 = test2.repeat()

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'variable'])

    assert.deepEqual(log(test3), [
      { type: TypeAction.Repeat, payload: undefined },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test3), {
      type: SYMBOL_INPUT_STRING,
      default: undefined,
      description: 'ABC',
      reducer,
      isEmpty: true,
      options: [],
      reference,
      repeat: true,
      variables: []
    })

    const test4 = test3.option('--option')

    assert.hasAllKeys(test4, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'default',
      'reducer',
      'option',
      'variable'
    ])

    assert.deepEqual(log(test4), [
      {
        type: TypeAction.Option,
        payload: {
          name: '--option'
        }
      },
      { type: TypeAction.Repeat, payload: undefined },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test4), {
      type: SYMBOL_INPUT_STRING,
      default: undefined,
      description: 'ABC',
      reducer,
      isEmpty: false,
      options: ['--option'],
      reference,
      repeat: true,
      variables: []
    })

    const test5 = test4.variable('VARIABLE')

    assert.hasAllKeys(test5, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'default',
      'reducer',
      'option',
      'variable'
    ])

    assert.deepEqual(log(test5), [
      {
        type: TypeAction.Variable,
        payload: 'VARIABLE'
      },
      {
        type: TypeAction.Option,
        payload: {
          name: '--option'
        }
      },
      { type: TypeAction.Repeat, payload: undefined },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test5), {
      type: SYMBOL_INPUT_STRING,
      default: undefined,
      description: 'ABC',
      reducer,
      isEmpty: false,
      options: ['--option'],
      reference,
      repeat: true,
      variables: ['VARIABLE']
    })

    const test6 = test5.default(['A', 'B', 'C'])

    assert.hasAllKeys(test6, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test6), [
      { type: TypeAction.Default, payload: ['A', 'B', 'C'] },
      {
        type: TypeAction.Variable,
        payload: 'VARIABLE'
      },
      {
        type: TypeAction.Option,
        payload: {
          name: '--option'
        }
      },
      { type: TypeAction.Repeat, payload: undefined },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test6), {
      type: SYMBOL_INPUT_STRING,
      default: ['A', 'B', 'C'],
      description: 'ABC',
      reducer,
      isEmpty: false,
      options: ['--option'],
      reference,
      repeat: true,
      variables: ['VARIABLE']
    })

    const fn = (_: LookupValues<typeof test5>) => {
      return 1 as const
    }

    const test7 = test5.reducer(fn)

    assert.hasAllKeys(test7, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test7), [
      {
        type: TypeAction.Reducer,
        payload: fn
      },
      {
        type: TypeAction.Variable,
        payload: 'VARIABLE'
      },
      {
        type: TypeAction.Option,
        payload: {
          name: '--option'
        }
      },
      { type: TypeAction.Repeat, payload: undefined },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    assert.deepEqual(state(test7), {
      type: SYMBOL_INPUT_STRING,
      default: undefined,
      description: 'ABC',
      reducer: state(test7).reducer,
      isEmpty: false,
      options: ['--option'],
      reference,
      repeat: true,
      variables: ['VARIABLE']
    })
  })
})
