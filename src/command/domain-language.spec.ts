import { log, state, SYMBOL_LOG, SYMBOL_STATE } from '@escapace/fluent'
import { assert, describe, it } from 'vitest'
import { boolean } from '../input/boolean/domain-language'
import { count } from '../input/count/domain-language'
import { type LookupValues, SYMBOL_COMMAND } from '../types'
import { extract } from '../utilities/extract'
import { command } from './domain-language'
import { reducer } from './reducer'
import { type PropertiesCommand, TypeAction } from './types'
// import { TypeAction } from './types'

describe('command', () => {
  it('domain-language', () => {
    const reference = 'test'

    assert.isFunction(command)

    const test0 = command()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      commands: [],
      description: undefined,
      inputs: [],
      isEmpty: true,
      names: [],
      options: [],
      reducer,
      reference: undefined,
      type: SYMBOL_COMMAND,
      variables: [],
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'name'])

    assert.deepEqual(log(test1), [
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test1), {
      commands: [],
      description: undefined,
      inputs: [],
      isEmpty: true,
      names: [],
      options: [],
      reducer,
      reference,
      type: SYMBOL_COMMAND,
      variables: [],
    })

    const test2 = test1.name('abc').name('qwe')

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'name', 'description'])

    assert.deepEqual(log(test2), [
      {
        payload: 'qwe',
        type: TypeAction.Name,
      },
      {
        payload: 'abc',
        type: TypeAction.Name,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test2), {
      commands: [],
      description: undefined,
      inputs: [],
      isEmpty: true,
      names: ['abc', 'qwe'],
      options: [],
      reducer,
      reference,
      type: SYMBOL_COMMAND,
      variables: [],
    })

    const test3 = test2.description('desc')

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE, 'input', 'subcommand', 'reducer'])

    assert.deepEqual(log(test3), [
      {
        payload: 'desc',
        type: TypeAction.Description,
      },
      {
        payload: 'qwe',
        type: TypeAction.Name,
      },
      {
        payload: 'abc',
        type: TypeAction.Name,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test3), {
      commands: [],
      description: 'desc',
      inputs: [],
      isEmpty: true,
      names: ['abc', 'qwe'],
      options: [],
      reducer,
      reference,
      type: SYMBOL_COMMAND,
      variables: [],
    })

    const booleanA = boolean()
      .reference('BooleanA')
      .description('BooleanA')
      .option('--boolean-a')
      .variable('BOOLEAN_A')

    const countA = count().reference('CountA').description('CountA').option('--count-a')

    const test4 = test3.input(booleanA).input(countA)

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE, 'input', 'reducer'])

    assert.deepEqual(log(test4), [
      {
        payload: extract(countA),
        type: TypeAction.Input,
      },
      {
        payload: extract(booleanA),
        type: TypeAction.Input,
      },
      {
        payload: 'desc',
        type: TypeAction.Description,
      },
      {
        payload: 'qwe',
        type: TypeAction.Name,
      },
      {
        payload: 'abc',
        type: TypeAction.Name,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test4), {
      commands: [],
      description: 'desc',
      inputs: [extract(booleanA), extract(countA)],
      isEmpty: false,
      names: ['abc', 'qwe'],
      options: [...state(booleanA).options, ...state(countA).options],
      reducer,
      reference,
      type: SYMBOL_COMMAND,
      variables: [...state(booleanA).variables],
    })

    const inputReducer = (values: LookupValues<typeof test4>, _: PropertiesCommand) => values

    const test5 = test4.reducer(inputReducer)

    assert.hasAllKeys(test5, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test5), [
      {
        payload: inputReducer,
        type: TypeAction.Reducer,
      },
      {
        payload: extract(countA),
        type: TypeAction.Input,
      },
      {
        payload: extract(booleanA),
        type: TypeAction.Input,
      },
      {
        payload: 'desc',
        type: TypeAction.Description,
      },
      {
        payload: 'qwe',
        type: TypeAction.Name,
      },
      {
        payload: 'abc',
        type: TypeAction.Name,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test5), {
      commands: [],
      description: 'desc',
      inputs: [extract(booleanA), extract(countA)],
      isEmpty: false,
      names: ['abc', 'qwe'],
      options: [...state(booleanA).options, ...state(countA).options],
      reducer: inputReducer,
      reference,
      type: SYMBOL_COMMAND,
      variables: [...state(booleanA).variables],
    })

    const commandA = command()
      .reference('commandA')
      .name('commandA')
      .description('commandA')
      .input(booleanA)

    const commandB = command()
      .reference('commandB')
      .name('commandB')
      .description('commandB')
      .input(countA)

    const test6 = test3.subcommand(commandA).subcommand(commandB)

    assert.hasAllKeys(test6, [SYMBOL_LOG, SYMBOL_STATE, 'subcommand', 'reducer'])

    assert.deepEqual(log(test6), [
      {
        payload: extract(commandB),
        type: TypeAction.Subcommand,
      },
      {
        payload: extract(commandA),
        type: TypeAction.Subcommand,
      },
      {
        payload: 'desc',
        type: TypeAction.Description,
      },
      {
        payload: 'qwe',
        type: TypeAction.Name,
      },
      {
        payload: 'abc',
        type: TypeAction.Name,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test6), {
      commands: [extract(commandA), extract(commandB)],
      description: 'desc',
      inputs: [],
      isEmpty: false,
      names: ['abc', 'qwe'],
      options: [...state(commandA).options, ...state(commandB).options],
      reducer,
      reference,
      type: SYMBOL_COMMAND,
      variables: [...state(commandA).variables],
    })

    const subcommandReducer = (values: LookupValues<typeof test6>, _: PropertiesCommand) => values

    const test7 = test6.reducer(subcommandReducer)

    assert.hasAllKeys(test7, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test7), [
      {
        payload: subcommandReducer,
        type: TypeAction.Reducer,
      },
      {
        payload: extract(commandB),
        type: TypeAction.Subcommand,
      },
      {
        payload: extract(commandA),
        type: TypeAction.Subcommand,
      },
      {
        payload: 'desc',
        type: TypeAction.Description,
      },
      {
        payload: 'qwe',
        type: TypeAction.Name,
      },
      {
        payload: 'abc',
        type: TypeAction.Name,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test7), {
      commands: [extract(commandA), extract(commandB)],
      description: 'desc',
      inputs: [],
      isEmpty: false,
      names: ['abc', 'qwe'],
      options: [...state(commandA).options, ...state(commandB).options],
      reducer: subcommandReducer,
      reference,
      type: SYMBOL_COMMAND,
      variables: [...state(commandA).variables],
    })

    const simpleReducer = (value: LookupValues<typeof test3>) => value

    const test8 = test3.reducer(simpleReducer)

    assert.hasAllKeys(test8, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test8), [
      {
        payload: simpleReducer,
        type: TypeAction.Reducer,
      },
      {
        payload: 'desc',
        type: TypeAction.Description,
      },
      {
        payload: 'qwe',
        type: TypeAction.Name,
      },
      {
        payload: 'abc',
        type: TypeAction.Name,
      },
      {
        payload: reference,
        type: TypeAction.Reference,
      },
    ])

    assert.deepEqual(state(test8), {
      commands: [],
      description: 'desc',
      inputs: [],
      isEmpty: false,
      names: ['abc', 'qwe'],
      options: [],
      reducer: simpleReducer,
      reference,
      type: SYMBOL_COMMAND,
      variables: [],
    })
  })
})
