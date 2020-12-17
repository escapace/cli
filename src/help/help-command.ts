import { performance } from 'perf_hooks'
import { command } from '../command/domain-language'

export const helpCommand = command()
  .reference('@escapace/cli/help-command')
  .name('help')
  .description('help')
  .reducer(({ _ }) => {
    console.log(performance.now(), _)
  })
