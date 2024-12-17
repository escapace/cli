import type { FluentInterface, Model, Reducer } from '@escapace/fluent'
import { help } from '../help/help'
import { group } from '../input/group/domain-language'
import type {
  ActionDescription,
  ActionInput,
  ActionReducer,
  ActionReference,
  Settings,
} from '../input/group/types'
import { PLACEHOLDER_REFERENCES } from '../types'
import { extract } from '../utilities/extract'
import { placeholderInputHelpBoolean } from './placeholder-input-boolean'

export const placeholderInputHelpGroup: FluentInterface<
  Model<
    Reducer<
      Settings,
      [
        ActionReducer<boolean | undefined>,
        ActionInput<typeof placeholderInputHelpBoolean>,
        ActionDescription,
        ActionReference<PLACEHOLDER_REFERENCES.INPUT>,
      ]
    >,
    [
      ActionReducer<boolean | undefined>,
      ActionInput<typeof placeholderInputHelpBoolean>,
      ActionDescription,
      ActionReference<PLACEHOLDER_REFERENCES.INPUT>,
    ]
  >
> = extract(
  group()
    .reference(PLACEHOLDER_REFERENCES.INPUT)
    .description('Help')
    .input(placeholderInputHelpBoolean)
    .reducer(async (values, properties): Promise<boolean | undefined> => {
      if (values[PLACEHOLDER_REFERENCES.HELP_BOOLEAN]) {
        await help(properties)
        await properties.context.exit()

        return
      } else {
        return values[PLACEHOLDER_REFERENCES.HELP_BOOLEAN]
      }
    }),
)
