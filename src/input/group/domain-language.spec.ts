import { log, state, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assert } from 'chai'
import { LookupValues, SYMBOL_INPUT_GROUP } from '../../types'
import { extract } from '../../utility/extract'
import { boolean } from '../boolean/domain-language'
import { count } from '../count/domain-language'
import { group } from './domain-language'
import { reducer } from './reducer'
import { PropsInputGroup, TypeAction } from './types'

describe('input/group', () => {
  it('domain-language', () => {
    const reference = 'test' as const

    assert.isFunction(group)
    assert.hasAllKeys(group(), [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    const test0 = group().reference(reference)

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'description'])

    assert.deepEqual(log(test0), [
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test0), {
      type: SYMBOL_INPUT_GROUP,
      description: undefined,
      isEmpty: true,
      inputs: [],
      options: [],
      reducer,
      reference,
      variables: []
    })

    const test1 = test0.description('description')

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'input'])

    assert.deepEqual(log(test1), [
      {
        type: TypeAction.Description,
        payload: 'description'
      },
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test1), {
      type: SYMBOL_INPUT_GROUP,
      description: 'description',
      isEmpty: true,
      inputs: [],
      options: [],
      reducer,
      reference,
      variables: []
    })

    const inputA = extract(
      count()
        .reference('count')
        .description('count')
        .option('-c')
        .option('--count')
    )

    const inputB = extract(
      boolean()
        .reference('boolean')
        .description('boolean')
        .option('-b')
        .option('--boolean')
    )

    const test2 = test1.input(inputA).input(inputB)

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'input', 'reducer'])

    assert.deepEqual(log(test2), [
      {
        type: TypeAction.Input,
        payload: inputB
      },
      {
        type: TypeAction.Input,
        payload: inputA
      },
      {
        type: TypeAction.Description,
        payload: 'description'
      },
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test2), {
      type: SYMBOL_INPUT_GROUP,
      description: 'description',
      isEmpty: false,
      inputs: [inputA, inputB],
      options: ['-c', '--count', '-b', '--boolean'],
      reducer,
      reference,
      variables: []
    })

    const fn = (value: LookupValues<typeof test2>, _: PropsInputGroup) => value

    const test3 = test2.reducer(fn)

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test3), [
      {
        type: TypeAction.Reducer,
        payload: fn
      },
      {
        type: TypeAction.Input,
        payload: inputB
      },
      {
        type: TypeAction.Input,
        payload: inputA
      },
      {
        type: TypeAction.Description,
        payload: 'description'
      },
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test3), {
      type: SYMBOL_INPUT_GROUP,
      description: 'description',
      isEmpty: false,
      inputs: [inputA, inputB],
      options: ['-c', '--count', '-b', '--boolean'],
      reducer: state(test3).reducer,
      reference,
      variables: []
    })
  })
})
