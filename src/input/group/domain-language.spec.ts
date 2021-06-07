// TODO: group domain language tests
// import { group } from './domain-language'
// import { reducer } from './reducer'
//
// import { SYMBOL_LOG, SYMBOL_STATE, log, state } from '@escapace/fluent'
// import { assert } from 'chai'
// import { SYMBOL_INPUT_STRING } from '../../types'
// import { TypeAction } from './types'
// import { boolean } from '../boolean/domain-language'
//
// describe('input/choice', () => {
//   it('domain-language', () => {
//     const reference = 'test' as const
//
//     assert.isFunction(group)
//
//     const booleanA = boolean().reference('asd').description('abc').option('-qweqwe', '-qasdzxc').variable('ASDJKHKW')
//     const booleanB = boolean().reference('asdd').description('abc').variable('BLA')
//
//     const test0 = group()
//     .reference(reference)
//     .description('abc')
//     .input(booleanA)
//     .reducer((asd) => {
//       const qwe = asd
//
//       return 1
//     })
//
//     const test1 = group()
//       .reference('qqwjek')
//       .description('abc')
//       .input(test0)
//       .input(booleanB)
//       .reducer((asd) => {
//         const qwe = asd
//
//         return 2
//       })
//
//     // const qwe = test0[SYMBOL_STATE].isEmpty
//
//     // assert.hasAllKeys(test0, [SYMBOL_LOG, SYMBOL_STATE, 'reference'])
//     //
//     // assert.deepEqual(log(test0), [])
//
//     // assert.deepEqual(state(test0), {
//     //   type: SYMBOL_INPUT_STRING,
//     //   default: undefined,
//     //   reducer,
//     //   description: undefined,
//     //   isEmpty: true,
//     //   options: [],
//     //   reference: undefined,
//     //   repeat: false,
//     //   variables: []
//     // })
//   })
// })
