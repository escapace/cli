import { log, state, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assert, describe, it } from 'vitest'
import { type LookupValues, SYMBOL_INPUT_GROUP } from '../../types'
import { extract } from '../../utilities/extract'
import { boolean } from '../boolean/domain-language'
import { count } from '../count/domain-language'
import { group } from './domain-language'
import { reducer } from './reducer'
import { type PropertiesInputGroup, TypeAction } from './types'

describe('input/group', () => {
  it('domain-language', () => {
    const reference = 'test'

    assert.isFunction(group)
    assert.hasAllKeys(group(), [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    const test0 = group().reference(reference)

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(log(test0), [
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test0), {
      description: undefined,
      inputs: [],
      isEmpty: true,
      options: [],
      reducer,
      reference,
      type: SYMBOL_INPUT_GROUP,
      variables: [],
    })

    const test1 = test0.description('description')

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'input'])

    assert.deepEqual(log(test1), [
      {
        payload: 'description',
        type: TypeAction.Description,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test1), {
      description: 'description',
      inputs: [],
      isEmpty: true,
      options: [],
      reducer,
      reference,
      type: SYMBOL_INPUT_GROUP,
      variables: [],
    })

    const inputA = extract(
      count().reference('count').description('count').option('-c').option('--count'),
    )

    const inputB = extract(
      boolean().reference('boolean').description('boolean').option('-b').option('--boolean'),
    )

    const test2 = test1.input(inputA).input(inputB)

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'input', 'reducer'])

    assert.deepEqual(log(test2), [
      {
        payload: inputB,
        type: TypeAction.Input,
      },
      {
        payload: inputA,
        type: TypeAction.Input,
      },
      {
        payload: 'description',
        type: TypeAction.Description,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test2), {
      description: 'description',
      inputs: [inputA, inputB],
      isEmpty: false,
      options: ['-c', '--count', '-b', '--boolean'],
      reducer,
      reference,
      type: SYMBOL_INPUT_GROUP,
      variables: [],
    })

    const function_ = (value: LookupValues<typeof test2>, _: PropertiesInputGroup) => value

    const test3 = test2.reducer(function_)

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test3), [
      {
        payload: function_,
        type: TypeAction.Reducer,
      },
      {
        payload: inputB,
        type: TypeAction.Input,
      },
      {
        payload: inputA,
        type: TypeAction.Input,
      },
      {
        payload: 'description',
        type: TypeAction.Description,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test3), {
      description: 'description',
      inputs: [inputA, inputB],
      isEmpty: false,
      options: ['-c', '--count', '-b', '--boolean'],
      reducer: state(test3).reducer,
      reference,
      type: SYMBOL_INPUT_GROUP,
      variables: [],
    })
  })
})
