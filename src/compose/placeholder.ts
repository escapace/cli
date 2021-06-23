import { command } from '../command/domain-language'
import { Command } from '../command/types'
import { boolean } from '../input/boolean/domain-language'
import { group } from '../input/group/domain-language'
import { extract } from '../utility/extract'
import { help } from '../help/help'

export enum PLACEHOLDER_REFERENCES {
  INPUT = '@escapace/cli/placeholder-input',
  COMMAND = '@escapace/cli/placeholder-input',
  HELP_BOOLEAN = '@escapace/cli/placeholder-help-boolean'
}

const helpBoolean = extract(
  boolean()
    .reference(PLACEHOLDER_REFERENCES.HELP_BOOLEAN)
    .description('Prints the synopsis and a list of all available commands.')
    .option('-h')
    .option('--help')
    .default(false)
)

export const placeholderInput = extract(
  group()
    .reference(PLACEHOLDER_REFERENCES.INPUT)
    .description('Help')
    .input(helpBoolean)
    .reducer(async (values, props) => {
      if (values[PLACEHOLDER_REFERENCES.HELP_BOOLEAN]) {
        await help(props)
        await props.context.exit()

        // eslint-disable-next-line no-useless-return
        return
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
      .reducer(async (_, props) => {
        await help({
          commands,
          settings: props.settings,
          context: props.context
        })
      })
  )
}
