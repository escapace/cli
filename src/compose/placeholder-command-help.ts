import type { FluentInterface, Model, Reducer } from '@escapace/fluent'
import { command } from '../command/domain-language'
import type {
  CommandActionDescription,
  CommandActionInput,
  CommandActionName,
  CommandActionReducer,
  CommandActionReference,
  Command,
  CommandSettings,
} from '../command/types'
import { help } from '../help/help'
import { PLACEHOLDER_REFERENCES } from '../types'
import { extract } from '../utilities/extract'
import { placeholderInputHelpBoolean } from './placeholder-input-boolean'

export const placeholderCommandHelp = (
  commands: Command[],
): FluentInterface<
  Model<
    Reducer<
      CommandSettings,
      [
        CommandActionReducer<undefined>,
        CommandActionInput<typeof placeholderInputHelpBoolean>,
        CommandActionDescription,
        CommandActionName<PLACEHOLDER_REFERENCES.NAME>,
        CommandActionReference<PLACEHOLDER_REFERENCES.COMMAND>,
      ]
    >,
    [
      CommandActionReducer<undefined>,
      CommandActionInput<typeof placeholderInputHelpBoolean>,
      CommandActionDescription,
      CommandActionName<PLACEHOLDER_REFERENCES.NAME>,
      CommandActionReference<PLACEHOLDER_REFERENCES.COMMAND>,
    ]
  >
> =>
  extract(
    command()
      .reference(PLACEHOLDER_REFERENCES.COMMAND)
      .name(PLACEHOLDER_REFERENCES.NAME)
      .description('')
      .input(placeholderInputHelpBoolean)
      .reducer(async (_, properties): Promise<undefined> => {
        await help({
          commands,
          context: properties.context,
          settings: properties.settings,
        })

        await properties.context.exit()
      }),
  )
