import { command } from './domain-language'

import { SYMBOL_LOG, SYMBOL_STATE, log, state } from '@escapace/fluent'
import { assert } from 'chai'
import { SYMBOL_COMMAND, LookupModel } from '../types'
// import { TypeAction } from './types'
import { reducer } from './reducer'
import { TypeAction, CommandReducer } from './types'
import { boolean } from '../input/boolean/domain-language'
import { count } from '../input/count/domain-language'
import { extract } from '../utilities/extract'

describe('command', () => {
  it('domain-language', () => {
    const reference = 'test' as const

    assert.isFunction(command)

    const test0 = command()

    assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])

    assert.deepEqual(log(test0), [])

    assert.deepEqual(state(test0), {
      type: SYMBOL_COMMAND,
      commands: [],
      description: undefined,
      inputs: [],
      isEmpty: true,
      names: [],
      options: [],
      reducer,
      reference: undefined,
      variables: []
    })

    const test1 = test0.reference(reference)

    assert.hasAllKeys(test1, [SYMBOL_LOG, SYMBOL_STATE, 'name'])

    assert.deepEqual(log(test1), [
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test1), {
      type: SYMBOL_COMMAND,
      commands: [],
      description: undefined,
      inputs: [],
      isEmpty: true,
      names: [],
      options: [],
      reducer,
      reference,
      variables: []
    })

    const test2 = test1.name('abc').name('qwe')

    assert.hasAllKeys(test2, [SYMBOL_LOG, SYMBOL_STATE, 'name', 'description'])

    assert.deepEqual(log(test2), [
      {
        type: TypeAction.Name,
        payload: 'qwe'
      },
      {
        type: TypeAction.Name,
        payload: 'abc'
      },
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test2), {
      type: SYMBOL_COMMAND,
      commands: [],
      description: undefined,
      inputs: [],
      isEmpty: true,
      names: ['qwe', 'abc'],
      options: [],
      reducer,
      reference,
      variables: []
    })

    const test3 = test2.description('desc')

    assert.hasAllKeys(test3, [SYMBOL_LOG, SYMBOL_STATE, 'input', 'subcommand'])

    assert.deepEqual(log(test3), [
      {
        type: TypeAction.Description,
        payload: 'desc'
      },
      {
        type: TypeAction.Name,
        payload: 'qwe'
      },
      {
        type: TypeAction.Name,
        payload: 'abc'
      },
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test3), {
      type: SYMBOL_COMMAND,
      commands: [],
      description: 'desc',
      inputs: [],
      isEmpty: true,
      names: ['qwe', 'abc'],
      options: [],
      reducer,
      reference,
      variables: []
    })

    const booleanA = boolean()
      .reference('BooleanA')
      .description('BooleanA')
      .option('--boolean-a')
      .variable('BOOLEAN_A')

    const countA = count()
      .reference('CountA')
      .description('CountA')
      .option('--count-a')

    const test4 = test3.input(booleanA).input(countA)

    assert.hasAllKeys(test4, [SYMBOL_LOG, SYMBOL_STATE, 'input', 'reducer'])

    assert.deepEqual(log(test4), [
      {
        type: TypeAction.Input,
        payload: extract(countA)
      },
      {
        type: TypeAction.Input,
        payload: extract(booleanA)
      },
      {
        type: TypeAction.Description,
        payload: 'desc'
      },
      {
        type: TypeAction.Name,
        payload: 'qwe'
      },
      {
        type: TypeAction.Name,
        payload: 'abc'
      },
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test4), {
      type: SYMBOL_COMMAND,
      commands: [],
      description: 'desc',
      inputs: [extract(countA), extract(booleanA)],
      isEmpty: false,
      names: ['qwe', 'abc'],
      options: [...state(countA).options, ...state(booleanA).options],
      reducer,
      reference,
      variables: [...state(booleanA).variables]
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputReducer: CommandReducer<any, LookupModel<typeof test4>> = (
      values
    ) => values

    const test5 = test4.reducer(inputReducer)

    assert.hasAllKeys(test5, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test5), [
      {
        type: TypeAction.Reducer,
        payload: inputReducer
      },
      {
        type: TypeAction.Input,
        payload: extract(countA)
      },
      {
        type: TypeAction.Input,
        payload: extract(booleanA)
      },
      {
        type: TypeAction.Description,
        payload: 'desc'
      },
      {
        type: TypeAction.Name,
        payload: 'qwe'
      },
      {
        type: TypeAction.Name,
        payload: 'abc'
      },
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test5), {
      type: SYMBOL_COMMAND,
      commands: [],
      description: 'desc',
      inputs: [extract(countA), extract(booleanA)],
      isEmpty: false,
      names: ['qwe', 'abc'],
      options: [...state(countA).options, ...state(booleanA).options],
      reducer: inputReducer,
      reference,
      variables: [...state(booleanA).variables]
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

    assert.hasAllKeys(test6, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'subcommand',
      'reducer'
    ])

    assert.deepEqual(log(test6), [
      {
        type: TypeAction.Subcommand,
        payload: extract(commandB)
      },
      {
        type: TypeAction.Subcommand,
        payload: extract(commandA)
      },
      {
        type: TypeAction.Description,
        payload: 'desc'
      },
      {
        type: TypeAction.Name,
        payload: 'qwe'
      },
      {
        type: TypeAction.Name,
        payload: 'abc'
      },
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test6), {
      type: SYMBOL_COMMAND,
      commands: [extract(commandB), extract(commandA)],
      description: 'desc',
      inputs: [],
      isEmpty: false,
      names: ['qwe', 'abc'],
      options: [...state(commandB).options, ...state(commandA).options],
      reducer,
      reference,
      variables: [...state(commandA).variables]
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subcommandReducer: CommandReducer<any, LookupModel<typeof test6>> = (
      values
    ) => values

    const test7 = test6.reducer(subcommandReducer)

    assert.hasAllKeys(test7, [SYMBOL_LOG, SYMBOL_STATE])

    assert.deepEqual(log(test7), [
      {
        type: TypeAction.Reducer,
        payload: subcommandReducer
      },
      {
        type: TypeAction.Subcommand,
        payload: extract(commandB)
      },
      {
        type: TypeAction.Subcommand,
        payload: extract(commandA)
      },
      {
        type: TypeAction.Description,
        payload: 'desc'
      },
      {
        type: TypeAction.Name,
        payload: 'qwe'
      },
      {
        type: TypeAction.Name,
        payload: 'abc'
      },
      {
        type: TypeAction.Reference,
        payload: reference
      }
    ])

    assert.deepEqual(state(test7), {
      type: SYMBOL_COMMAND,
      commands: [extract(commandB), extract(commandA)],
      description: 'desc',
      inputs: [],
      isEmpty: false,
      names: ['qwe', 'abc'],
      options: [...state(commandB).options, ...state(commandA).options],
      reducer: subcommandReducer,
      reference,
      variables: [...state(commandA).variables]
    })
  })
})
