import { command } from '../command/domain-language'

export const helpCommand = command()
  .reference('@escapace/cli/help')
  .name('help')
  .description('help')
  .reducer(({ _ }) => {
    console.log(_)
  })
