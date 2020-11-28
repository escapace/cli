/* eslint-disable @typescript-eslint/no-floating-promises */
import { assert } from 'chai'
import { spy as Spy } from 'sinon'
import { choice } from '../input/choice/domain-language'
import { count } from '../input/count/domain-language'
import { compose } from './compose'
import { command } from './domain-language'

enum TypeExample {
  GRILLED_VEGETABLES = 'GRILLED_VEGETABLES',
  SALAD = 'SALAD',
  BRUNCH = 'BRUNCH',
  TIP = 'TIP',
  BILL = 'BILL',
  TAKEOUT = 'TAKEOUT',
  KITCHEN = 'KITCHEN',
  OMAKASE = 'OMAKASE'
}

const setup = () => {
  const spy = Spy()

  const grilledVegetables = choice()
    .reference(TypeExample.GRILLED_VEGETABLES)
    .description('Favorite recipes for grilled veggies.')
    .choices('elote', 'cauliflower', 'hasselback-potatoes', 'vegetable-skewers')
    .option('--grilled-vegetables')

  const salad = choice()
    .reference(TypeExample.SALAD)
    .description(
      'Fruit salads, fresh vegetable salads, and all the other combinations which make healthy taste so delicious.'
    )
    .choices(
      'greek',
      'watermelon-feta',
      'caprese',
      'tuna-poke',
      'cesar',
      'potato',
      'seafood'
    )
    .option('--salad')
    .option('-s')
    .default('greek')

  const brunch = command()
    .reference(TypeExample.BRUNCH)
    .name('brunch')
    .name('breakfast-lunch')
    .description('A combination of breakfast and lunch.')
    .input(grilledVegetables)
    .input(salad)
    .reducer(async (value, model) => {
      spy(value, model)

      return value
    })

  const tip = count()
    .reference(TypeExample.TIP)
    .description('Leave a tip')
    .option('-t')
    .option('--tip')
    .default(2)

  const bill = command()
    .reference(TypeExample.BILL)
    .name('bill')
    .description('Ask for the bill')
    .input(tip)
    .reducer(async (...args) => {
      spy(...args)

      return args[0]
    })

  const takeout = command()
    .reference(TypeExample.TAKEOUT)
    .name('takeout')
    .description('Order a takeout')
    .subcommand(brunch)
    .subcommand(bill)
    .reducer(async (...args) => {
      spy(...args)

      return args[0]
    })

  const omakase = command()
    .reference(TypeExample.OMAKASE)
    .name('omakase')
    .description("chef's choice")
    .reducer(async (...args) => {
      spy(...args)

      return args[0]
    })

  const kitchen = command()
    .reference(TypeExample.KITCHEN)
    .name('kitchen')
    .name('kn')
    .description('Regional Cousine')
    .subcommand(brunch)
    .subcommand(bill)
    .subcommand(takeout)
    .subcommand(omakase)
    .reducer(async (...args) => {
      spy(...args)

      return args[0]
    })

  return {
    bill,
    brunch,
    grilledVegetables,
    kitchen,
    salad,
    spy,
    takeout,
    tip
  }
}

describe('..,', () => {
  it('omakase', async () => {
    const { kitchen, spy } = setup()

    await compose(kitchen)({
      argv: ['kitchen', 'omakase', 'an argument', 'second argument']
    })

    assert.equal(spy.callCount, 2)

    assert.equal(spy.firstCall.args.length, 2)
    // assert.equal(spy.firstCall.args[1].state.reference, TypeExample.)

    assert.deepEqual(spy.firstCall.args[0], {
      _: ['an argument', 'second argument']
    })

    assert.deepEqual(spy.secondCall.args[0], {
      reference: TypeExample.OMAKASE,
      value: {
        _: ['an argument', 'second argument']
      }
    })
  })

  it('takoeut', async () => {
    const { kitchen, spy } = setup()

    await compose(kitchen)({
      argv: [
        'kitchen',
        'takeout',
        '-s',
        'seafood',
        'brunch',
        '--grilled-vegetables',
        'elote',
        'an argument',
        'second argument'
      ]
    })

    assert.equal(spy.callCount, 3)

    assert.equal(spy.firstCall.args.length, 2)
    assert.equal(spy.firstCall.args[1].state.reference, TypeExample.BRUNCH)

    assert.deepEqual(spy.firstCall.args[0], {
      _: ['an argument', 'second argument'],
      [TypeExample.SALAD]: 'seafood',
      [TypeExample.GRILLED_VEGETABLES]: 'elote'
    })

    assert.equal(spy.secondCall.args.length, 2)
    assert.equal(spy.secondCall.args[1].state.reference, TypeExample.TAKEOUT)

    assert.deepEqual(spy.secondCall.args[0], {
      reference: TypeExample.BRUNCH,
      value: {
        _: ['an argument', 'second argument'],
        [TypeExample.SALAD]: 'seafood',
        [TypeExample.GRILLED_VEGETABLES]: 'elote'
      }
    })

    assert.equal(spy.thirdCall.args.length, 2)
    assert.equal(spy.thirdCall.args[1].state.reference, TypeExample.KITCHEN)

    assert.deepEqual(spy.thirdCall.args[0], {
      reference: TypeExample.TAKEOUT,
      value: {
        reference: TypeExample.BRUNCH,
        value: {
          _: ['an argument', 'second argument'],
          [TypeExample.SALAD]: 'seafood',
          [TypeExample.GRILLED_VEGETABLES]: 'elote'
        }
      }
    })
  })
})
