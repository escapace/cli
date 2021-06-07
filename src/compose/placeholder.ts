import { command } from '../command/domain-language'
import { Command } from '../command/types'
import { boolean } from '../input/boolean/domain-language'
import { group } from '../input/group/domain-language'
import { extract } from '../utility/extract'
import { renderHelp } from './render-help'

export enum PLACEHOLDER_REFERENCES {
  INPUT = '@escapace/cli/placeholder-input',
  COMMAND = '@escapace/cli/placeholder-input',
  HELP_BOOLEAN = '@escapace/cli/placeholder-help-boolean'
}

const helpBoolean = extract(
  boolean()
    .reference(PLACEHOLDER_REFERENCES.HELP_BOOLEAN)
    .description('TODO: help1')
    .option('-h')
    .option('--help')
    .default(false)
)

export const placeholderInput = extract(
  group()
    .reference(PLACEHOLDER_REFERENCES.INPUT)
    .description('TODO: help2')
    .input(helpBoolean)
    .reducer((values, props) => {
      if (values[PLACEHOLDER_REFERENCES.HELP_BOOLEAN]) {
        return renderHelp(props)
      } else {
        return values[PLACEHOLDER_REFERENCES.HELP_BOOLEAN]
      }
    })
)

export const placeholderCommand = (commands: Command[]) => {
  return extract(
    command()
      .reference(PLACEHOLDER_REFERENCES.COMMAND)
      .name('placeholder')
      .description('')
      .input(helpBoolean)
      .reducer((_, props) => {
        renderHelp({
          commands,
          settings: props.settings
        })
      })
  )
}
