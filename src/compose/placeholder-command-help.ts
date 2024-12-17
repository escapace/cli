import type { FluentInterface, Model, Reducer } from '@escapace/fluent'
import { command } from '../command/domain-language'
import type {
  ActionDescription,
  ActionInput,
  ActionName,
  ActionReducer,
  ActionReference,
  Command,
  Settings,
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
      Settings,
      [
        ActionReducer<undefined>,
        ActionInput<typeof placeholderInputHelpBoolean>,
        ActionDescription,
        ActionName<PLACEHOLDER_REFERENCES.NAME>,
        ActionReference<PLACEHOLDER_REFERENCES.COMMAND>,
      ]
    >,
    [
      ActionReducer<undefined>,
      ActionInput<typeof placeholderInputHelpBoolean>,
      ActionDescription,
      ActionName<PLACEHOLDER_REFERENCES.NAME>,
      ActionReference<PLACEHOLDER_REFERENCES.COMMAND>,
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
