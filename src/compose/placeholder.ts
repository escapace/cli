import { command } from '../command/domain-language'
import type { Command } from '../command/types'
import { help } from '../help/help'
import { boolean } from '../input/boolean/domain-language'
import { group } from '../input/group/domain-language'
import { extract } from '../utility/extract'

export enum PLACEHOLDER_REFERENCES {
  COMMAND = '@escapace/cli/placeholder-command',
  HELP_BOOLEAN = '@escapace/cli/placeholder-help-boolean',
  INPUT = '@escapace/cli/placeholder-input',
  NAME = 'placeholder',
}

const helpBoolean = extract(
  boolean()
    .reference(PLACEHOLDER_REFERENCES.HELP_BOOLEAN)
    .description('Prints the synopsis and a list of all available commands.')
    .option('-h')
    .option('--help')
    .default(false),
)

export const placeholderInput = extract(
  group()
    .reference(PLACEHOLDER_REFERENCES.INPUT)
    .description('Help')
    .input(helpBoolean)
    .reducer(async (values, properties) => {
      if (values[PLACEHOLDER_REFERENCES.HELP_BOOLEAN]) {
        await help(properties)
        await properties.context.exit()

        return
      } else {
        return values[PLACEHOLDER_REFERENCES.HELP_BOOLEAN]
      }
    }),
)

export const placeholderCommand = (commands: Command[]) =>
  extract(
    command()
      .reference(PLACEHOLDER_REFERENCES.COMMAND)
      .name(PLACEHOLDER_REFERENCES.NAME)
      .description('')
      .input(helpBoolean)
      .reducer(async (_, properties) => {
        await help({
          commands,
          context: properties.context,
          settings: properties.settings,
        })

        await properties.context.exit()
      }),
  )
