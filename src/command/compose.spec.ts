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
  KITCHEN = 'KITCHEN'
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
    .reducer(async (value) => {
      spy(value)

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
    .reducer((value) => {
      spy(value)

      return value
    })

  const takeout = command()
    .reference(TypeExample.TAKEOUT)
    .name('takeout')
    .description('Order a takeout')
    .subcommand(brunch)
    .subcommand(bill)
    .reducer((value) => {
      spy(value)

      return value
    })

  const kitchen = command()
    .reference(TypeExample.KITCHEN)
    .name('kitchen')
    .name('kn')
    .description('Regional Cousine')
    .subcommand(brunch)
    .subcommand(bill)
    .subcommand(takeout)
    .reducer((value) => {
      spy(value)

      return value
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
  it('order', async () => {
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

    assert.deepEqual(spy.firstCall.args[0], {
      reference: TypeExample.BRUNCH,
      value: {
        _: ['an argument', 'second argument'],
        [TypeExample.SALAD]: 'seafood',
        [TypeExample.GRILLED_VEGETABLES]: 'elote'
      }
    })

    assert.deepEqual(spy.secondCall.args[0], {
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

    assert.deepEqual(spy.thirdCall.args[0], {
      reference: TypeExample.KITCHEN,
      value: {
        reference: TypeExample.TAKEOUT,
        value: {
          reference: TypeExample.BRUNCH,
          value: {
            _: ['an argument', 'second argument'],
            [TypeExample.SALAD]: 'seafood',
            [TypeExample.GRILLED_VEGETABLES]: 'elote'
          }
        }
      }
    })
  })
})
