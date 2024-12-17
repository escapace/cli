/* eslint-disable typescript/require-await */
import { vi } from 'vitest'
import { command } from './command/domain-language'
import { choice } from './input/choice/domain-language'
import { count } from './input/count/domain-language'

export enum TypeFixture {
  BILL = 'BILL',
  BRUNCH = 'BRUNCH',
  GRILLED_VEGETABLES = 'GRILLED_VEGETABLES',
  KITCHEN = 'KITCHEN',
  OMAKASE = 'OMAKASE',
  SALAD = 'SALAD',
  TAKEOUT = 'TAKEOUT',
  TIP = 'TIP',
}

export const testFixture = () => {
  const spy = vi.fn()

  const grilledVegetables = choice()
    .reference(TypeFixture.GRILLED_VEGETABLES)
    .description('Favorite recipes for grilled veggies.')
    .choices('elote', 'cauliflower', 'hasselback-potatoes', 'vegetable-skewers')
    .option('--grilled-vegetables')

  const salad = choice()
    .reference(TypeFixture.SALAD)
    .description(
      'Fruit salads, fresh vegetable salads, and all the other combinations which make healthy taste so delicious.',
    )
    .choices('greek', 'watermelon-feta', 'caprese', 'tuna-poke', 'cesar', 'potato', 'seafood')
    .option('--salad')
    .option('-s')
    .default('greek')

  const brunch = command()
    .reference(TypeFixture.BRUNCH)
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
    .reference(TypeFixture.TIP)
    .description('Leave a tip')
    .option('-t')
    .option('--tip')
    .default(2)

  const bill = command()
    .reference(TypeFixture.BILL)
    .name('bill')
    .description('Ask for the bill')
    .input(tip)
    .reducer(async (...arguments_) => {
      spy(...arguments_)

      return arguments_[0]
    })

  const takeout = command()
    .reference(TypeFixture.TAKEOUT)
    .name('takeout')
    .description('Order a takeout')
    .subcommand(brunch)
    .subcommand(bill)
    .reducer(async (...arguments_) => {
      spy(...arguments_)

      return arguments_[0]
    })

  const omakase = command()
    .reference(TypeFixture.OMAKASE)
    .name('omakase')
    .description("chef's choice")
    .reducer(async (...arguments_) => {
      spy(...arguments_)

      return arguments_[0]
    })

  const kitchen = command()
    .reference(TypeFixture.KITCHEN)
    .name('kitchen')
    .name('kn')
    .description('Regional Cousine')
    .subcommand(brunch)
    .subcommand(bill)
    .subcommand(takeout)
    .subcommand(omakase)
    .reducer(async (...arguments_) => {
      spy(...arguments_)

      return arguments_[0]
    })

  return {
    bill,
    brunch,
    grilledVegetables,
    kitchen,
    salad,
    spy,
    takeout,
    tip,
  }
}
