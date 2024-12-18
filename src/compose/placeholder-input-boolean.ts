import type { FluentInterface, Model, Reducer } from '@escapace/fluent'
import { boolean } from '../input/boolean/domain-language'
import type {
  InputBooleanActionDefault,
  InputBooleanActionDescription,
  InputBooleanActionOption,
  InputBooleanActionReference,
  InputBooleanSettings,
} from '../input/boolean/types'
import { PLACEHOLDER_REFERENCES } from '../types'
import { extract } from '../utilities/extract'

export const placeholderInputHelpBoolean: FluentInterface<
  Model<
    Reducer<
      InputBooleanSettings,
      [
        InputBooleanActionDefault<false>,
        InputBooleanActionOption<'--help', undefined>,
        InputBooleanActionOption<'-h', undefined>,
        InputBooleanActionDescription,
        InputBooleanActionReference<PLACEHOLDER_REFERENCES.HELP_BOOLEAN>,
      ]
    >,
    [
      InputBooleanActionDefault<false>,
      InputBooleanActionOption<'--help', undefined>,
      InputBooleanActionOption<'-h', undefined>,
      InputBooleanActionDescription,
      InputBooleanActionReference<PLACEHOLDER_REFERENCES.HELP_BOOLEAN>,
    ]
  >
> = extract(
  boolean()
    .reference(PLACEHOLDER_REFERENCES.HELP_BOOLEAN)
    .description('Prints the synopsis and a list of all available commands.')
    .option('-h')
    .option('--help')
    .default(false),
)
