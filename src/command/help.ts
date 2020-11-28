import { command } from './domain-language'

export const help = command()
  .reference('@escapace/cli/help')
  .name('help')
  .description('help')
  .reducer(({ _ }) => {
    console.log(_)
  })
