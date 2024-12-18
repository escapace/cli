import { log, state, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assert, describe, it } from 'vitest'
import { SYMBOL_INPUT_CHOICE } from '../../types'
import { choice } from './domain-language'
import { reducer } from './reducer'
import { InputChoiceTypeAction } from './types'

describe('input/choice', () => {
  it('domain-language', () => {
    const reference = 'test'

    assert.isFunction(choice)

    const test0 = choice()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      choices: [],
      default: undefined,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference: undefined,
      repeat: false,
      type: SYMBOL_INPUT_CHOICE,
      variables: [],
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(log(test1), [{ payload: reference, type: InputChoiceTypeAction.Reference }])

    assert.deepEqual(state(test1), {
      choices: [],
      default: undefined,
      description: undefined,
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: false,
      type: SYMBOL_INPUT_CHOICE,
      variables: [],
    })

    const test2 = test1.description('ABC')

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'choices'])

    assert.deepEqual(log(test2), [
      { payload: 'ABC', type: InputChoiceTypeAction.Description },
      { payload: reference, type: InputChoiceTypeAction.Reference },
    ])

    assert.deepEqual(state(test2), {
      choices: [],
      default: undefined,
      description: 'ABC',
      isEmpty: true,
      options: [],
      reducer,
      reference,
      repeat: false,
      type: SYMBOL_INPUT_CHOICE,
      variables: [],
    })

    const test3 = test2.choices('A', 'B')

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'repeat', 'variable'])

    assert.deepEqual(log(test3), [
      { payload: ['A', 'B'], type: InputChoiceTypeAction.Choices },
      { payload: 'ABC', type: InputChoiceTypeAction.Description },
      { payload: reference, type: InputChoiceTypeAction.Reference },
    ])

    assert.deepEqual(state(test3), {
      choices: ['A', 'B'],
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: [],
      reducer,
      reference,
      repeat: false,
      type: SYMBOL_INPUT_CHOICE,
      variables: [],
    })

    const test4 = test3.repeat()

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE, 'option', 'variable'])

    assert.deepEqual(log(test4), [
      { payload: undefined, type: InputChoiceTypeAction.Repeat },
      { payload: ['A', 'B'], type: InputChoiceTypeAction.Choices },
      { payload: 'ABC', type: InputChoiceTypeAction.Description },
      { payload: reference, type: InputChoiceTypeAction.Reference },
    ])

    assert.deepEqual(state(test4), {
      choices: ['A', 'B'],
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: [],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_CHOICE,
      variables: [],
    })

    const test5 = test4.option('--option')

    assert.hasAllKeys(test5, [SYMBOL_LOG, SYMBOL_STATE, 'default', 'option', 'variable'])

    assert.deepEqual(log(test5), [
      {
        payload: {
          name: '--option',
        },
        type: InputChoiceTypeAction.Option,
      },
      { payload: undefined, type: InputChoiceTypeAction.Repeat },
      { payload: ['A', 'B'], type: InputChoiceTypeAction.Choices },
      { payload: 'ABC', type: InputChoiceTypeAction.Description },
      { payload: reference, type: InputChoiceTypeAction.Reference },
    ])

    assert.deepEqual(state(test5), {
      choices: ['A', 'B'],
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_CHOICE,
      variables: [],
    })

    const test6 = test5.variable('VARIABLE')

    assert.hasAllKeys(test6, [SYMBOL_LOG, SYMBOL_STATE, 'default', 'option', 'variable'])

    assert.deepEqual(log(test6), [
      {
        payload: 'VARIABLE',
        type: InputChoiceTypeAction.Variable,
      },
      {
        payload: {
          name: '--option',
        },
        type: InputChoiceTypeAction.Option,
      },
      { payload: undefined, type: InputChoiceTypeAction.Repeat },
      { payload: ['A', 'B'], type: InputChoiceTypeAction.Choices },
      { payload: 'ABC', type: InputChoiceTypeAction.Description },
      { payload: reference, type: InputChoiceTypeAction.Reference },
    ])

    assert.deepEqual(state(test6), {
      choices: ['A', 'B'],
      default: undefined,
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_CHOICE,
      variables: ['VARIABLE'],
    })

    const test7 = test6.default(['B'])

    assert.hasAllKeys(test7, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test7), [
      { payload: ['B'], type: InputChoiceTypeAction.Default },
      {
        payload: 'VARIABLE',
        type: InputChoiceTypeAction.Variable,
      },
      {
        payload: {
          name: '--option',
        },
        type: InputChoiceTypeAction.Option,
      },
      { payload: undefined, type: InputChoiceTypeAction.Repeat },
      { payload: ['A', 'B'], type: InputChoiceTypeAction.Choices },
      { payload: 'ABC', type: InputChoiceTypeAction.Description },
      { payload: reference, type: InputChoiceTypeAction.Reference },
    ])

    assert.deepEqual(state(test7), {
      choices: ['A', 'B'],
      default: ['B'],
      description: 'ABC',
      isEmpty: false,
      options: ['--option'],
      reducer,
      reference,
      repeat: true,
      type: SYMBOL_INPUT_CHOICE,
      variables: ['VARIABLE'],
    })
  })
})
