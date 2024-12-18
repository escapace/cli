import { log, state, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assert, describe, it } from 'vitest'
import { SYMBOL_INPUT_BOOLEAN } from '../../types'
import { boolean } from './domain-language'
import { reducer } from './reducer'
import { InputBooleanTypeAction } from './types'

describe('input/boolean', () => {
  it('domain-language', () => {
    const reference = 'test'

    assert.isFunction(boolean)

    const test0 = boolean()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      default: undefined,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference: undefined,
      table: {
        options: {},
        variables: {},
      },
      type: SYMBOL_INPUT_BOOLEAN,
      variables: [],
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(state(test1), {
      default: undefined,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference,
      table: {
        options: {},
        variables: {},
      },
      type: SYMBOL_INPUT_BOOLEAN,
      variables: [],
    })

    assert.deepEqual(log(test1), [{ payload: reference, type: InputBooleanTypeAction.Reference }])

    const test2 = test1.description('ABC')

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'variable'])

    assert.deepEqual(state(test2), {
      default: undefined,
      description: 'ABC',
      isEmpty: true,
      options: [],
      reducer,
      reference,
      table: {
        options: {},
        variables: {},
      },
      type: SYMBOL_INPUT_BOOLEAN,
      variables: [],
    })

    assert.deepEqual(log(test2), [
      { payload: 'ABC', type: InputBooleanTypeAction.Description },
      { payload: reference, type: InputBooleanTypeAction.Reference },
    ])

    const test3 = test2.variable('VARIABLE', 'NO_VARIABLE').option('--option', '--no-option')

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'variable', 'default'])

    assert.deepEqual(state(test3), {
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: ['--option', '--no-option'],
      reducer,
      reference,
      table: {
        options: {
          '--no-option': false,
          '--option': true,
        },
        variables: {
          NO_VARIABLE: false,
          VARIABLE: true,
        },
      },
      type: SYMBOL_INPUT_BOOLEAN,
      variables: ['VARIABLE', 'NO_VARIABLE'],
    })

    assert.deepEqual(log(test3), [
      {
        payload: {
          false: '--no-option',
          true: '--option',
        },
        type: InputBooleanTypeAction.Option,
      },
      {
        payload: {
          false: 'NO_VARIABLE',
          true: 'VARIABLE',
        },
        type: InputBooleanTypeAction.Variable,
      },
      { payload: 'ABC', type: InputBooleanTypeAction.Description },
      { payload: reference, type: InputBooleanTypeAction.Reference },
    ])

    const test4 = test3.default(false)

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(state(test4), {
      default: false,
      description: 'ABC',
      isEmpty: false,
      options: ['--option', '--no-option'],
      reducer,
      reference,
      table: {
        options: {
          '--no-option': false,
          '--option': true,
        },
        variables: {
          NO_VARIABLE: false,
          VARIABLE: true,
        },
      },
      type: SYMBOL_INPUT_BOOLEAN,
      variables: ['VARIABLE', 'NO_VARIABLE'],
    })

    assert.deepEqual(log(test4), [
      { payload: false, type: InputBooleanTypeAction.Default },
      {
        payload: {
          false: '--no-option',
          true: '--option',
        },
        type: InputBooleanTypeAction.Option,
      },
      {
        payload: {
          false: 'NO_VARIABLE',
          true: 'VARIABLE',
        },
        type: InputBooleanTypeAction.Variable,
      },
      { payload: 'ABC', type: InputBooleanTypeAction.Description },
      { payload: reference, type: InputBooleanTypeAction.Reference },
    ])
  })
})
