import { boolean } from './domain-language'

import { SYMBOL_LOG, SYMBOL_STATE, log, state } from '@escapace/fluent'
import { assert } from 'chai'
import { SYMBOL_INPUT_BOOLEAN } from '../../types'
import { TypeAction } from './types'
import { reducer } from './reducer'

describe('input/boolean', () => {
  it('domain-language', () => {
    const reference = 'test' as const

    assert.isFunction(boolean)

    const test0 = boolean()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      type: SYMBOL_INPUT_BOOLEAN,
      isEmpty: true,
      reference: undefined,
      reducer,
      description: undefined,
      default: undefined,
      options: [],
      variables: [],
      table: {
        options: {},
        variables: {}
      }
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(state(test1), {
      type: SYMBOL_INPUT_BOOLEAN,
      isEmpty: true,
      reference,
      reducer,
      description: undefined,
      default: undefined,
      options: [],
      variables: [],
      table: {
        options: {},
        variables: {}
      }
    })

    assert.deepEqual(log(test1), [
      { type: TypeAction.Reference, payload: reference }
    ])

    const test2 = test1.description('ABC')

    assert.hasAllKeys(test2, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'option',
      'variable',
      'default'
    ])

    assert.deepEqual(state(test2), {
      type: SYMBOL_INPUT_BOOLEAN,
      isEmpty: true,
      reference,
      description: 'ABC',
      default: undefined,
      reducer,
      options: [],
      variables: [],
      table: {
        options: {},
        variables: {}
      }
    })

    assert.deepEqual(log(test2), [
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    const test3 = test2
      .variable('VARIABLE', 'NO_VARIABLE')
      .option('--option', '--no-option')

    assert.hasAllKeys(test3, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'option',
      'variable',
      'default'
    ])

    assert.deepEqual(state(test3), {
      type: SYMBOL_INPUT_BOOLEAN,
      isEmpty: false,
      reference,
      description: 'ABC',
      reducer,
      default: undefined,
      options: ['--option', '--no-option'],
      variables: ['VARIABLE', 'NO_VARIABLE'],
      table: {
        options: {
          '--no-option': false,
          '--option': true
        },
        variables: {
          NO_VARIABLE: false,
          VARIABLE: true
        }
      }
    })

    assert.deepEqual(log(test3), [
      {
        type: TypeAction.Option,
        payload: {
          true: '--option',
          false: '--no-option'
        }
      },
      {
        type: TypeAction.Variable,
        payload: {
          true: 'VARIABLE',
          false: 'NO_VARIABLE'
        }
      },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])

    const test4 = test3.default(false)

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(state(test4), {
      type: SYMBOL_INPUT_BOOLEAN,
      isEmpty: false,
      reference,
      description: 'ABC',
      reducer,
      default: false,
      options: ['--option', '--no-option'],
      variables: ['VARIABLE', 'NO_VARIABLE'],
      table: {
        options: {
          '--no-option': false,
          '--option': true
        },
        variables: {
          NO_VARIABLE: false,
          VARIABLE: true
        }
      }
    })

    assert.deepEqual(log(test4), [
      { type: TypeAction.Default, payload: false },
      {
        type: TypeAction.Option,
        payload: {
          true: '--option',
          false: '--no-option'
        }
      },
      {
        type: TypeAction.Variable,
        payload: {
          true: 'VARIABLE',
          false: 'NO_VARIABLE'
        }
      },
      { type: TypeAction.Description, payload: 'ABC' },
      { type: TypeAction.Reference, payload: reference }
    ])
  })
})
