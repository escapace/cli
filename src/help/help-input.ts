import { boolean } from '../input/boolean/domain-language'

export const helpInput = boolean()
  .reference('@escapace/cli/help-input')
  .description('abcd')
  .option('-h')
