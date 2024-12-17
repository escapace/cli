import type { FluentInterface, Model, Reducer } from '@escapace/fluent'
import { boolean } from '../input/boolean/domain-language'
import type {
  ActionDefault,
  ActionDescription,
  ActionOption,
  ActionReference,
  Settings,
} from '../input/boolean/types'
import { PLACEHOLDER_REFERENCES } from '../types'
import { extract } from '../utilities/extract'

export const placeholderInputHelpBoolean: FluentInterface<
  Model<
    Reducer<
      Settings,
      [
        ActionDefault<false>,
        ActionOption<'--help', undefined>,
        ActionOption<'-h', undefined>,
        ActionDescription,
        ActionReference<PLACEHOLDER_REFERENCES.HELP_BOOLEAN>,
      ]
    >,
    [
      ActionDefault<false>,
      ActionOption<'--help', undefined>,
      ActionOption<'-h', undefined>,
      ActionDescription,
      ActionReference<PLACEHOLDER_REFERENCES.HELP_BOOLEAN>,
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
