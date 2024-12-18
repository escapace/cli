import { noop } from 'lodash-es'
import { composeFactory } from './compose/compose-factory'

export { command } from './command/domain-language'
export type { CommandProperties as PropertiesCommand } from './command/types'

export { boolean } from './input/boolean/domain-language'
export type { PropertiesInputBoolean } from './input/boolean/types'

export { choice } from './input/choice/domain-language'
export type { PropertiesInputChoice } from './input/choice/types'

export { count } from './input/count/domain-language'
export type { PropertiesInputCount } from './input/count/types'

export { group } from './input/group/domain-language'
export type { PropertiesInputGroup } from './input/group/types'

export { string } from './input/string/domain-language'
export type { InputStringProperties as PropertiesInputString } from './input/string/types'

export type {
  Compose,
  Context,
  Input,
  LookupModel,
  LookupValues,
  Reference,
  Settings,
} from './types'

export const compose = composeFactory({
  argv: __PLATFORM__ === 'node' ? process.argv.slice(2) : [],
  console,
  env: __PLATFORM__ === 'node' ? process.env : {},
  exit: __PLATFORM__ === 'node' ? (code?: number) => process.exit(code) : noop,
})
