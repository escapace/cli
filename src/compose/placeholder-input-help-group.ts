import type { FluentInterface, Model, Reducer } from '@escapace/fluent'
import { help } from '../help/help'
import { group } from '../input/group/domain-language'
import type {
  InputGroupActionDescription,
  InputGroupActionInput,
  InputGroupActionReducer,
  InputGroupActionReference,
  InputGroupSettings,
} from '../input/group/types'
import { PLACEHOLDER_REFERENCES } from '../types'
import { extract } from '../utilities/extract'
import { placeholderInputHelpBoolean } from './placeholder-input-boolean'

export const placeholderInputHelpGroup: FluentInterface<
  Model<
    Reducer<
      InputGroupSettings,
      [
        InputGroupActionReducer<boolean | undefined>,
        InputGroupActionInput<typeof placeholderInputHelpBoolean>,
        InputGroupActionDescription,
        InputGroupActionReference<PLACEHOLDER_REFERENCES.INPUT>,
      ]
    >,
    [
      InputGroupActionReducer<boolean | undefined>,
      InputGroupActionInput<typeof placeholderInputHelpBoolean>,
      InputGroupActionDescription,
      InputGroupActionReference<PLACEHOLDER_REFERENCES.INPUT>,
    ]
  >
> = extract(
  group()
    .reference(PLACEHOLDER_REFERENCES.INPUT)
    .description('Help')
    .input(placeholderInputHelpBoolean)
    .reducer(async (values, properties): Promise<boolean | undefined> => {
      if (values[PLACEHOLDER_REFERENCES.BOOLEAN]) {
        await help(properties)
        await properties.context.exit()

        return
      } else {
        return values[PLACEHOLDER_REFERENCES.BOOLEAN]
      }
    }),
)
