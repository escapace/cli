export { command } from './command/domain-language'
export { boolean } from './input/boolean/domain-language'
export { choice } from './input/choice/domain-language'
export { count } from './input/count/domain-language'
export { group } from './input/group/domain-language'
export { string } from './input/string/domain-language'

export type {
  Compose,
  Context,
  Input,
  LookupModel,
  LookupValues,
  Reference,
  Settings,
} from './types'

export type * from './command/types'
export type * from './input/boolean/types'
export type * from './input/choice/types'
export type * from './input/count/types'
export type * from './input/group/types'
export type * from './input/string/types'

import { noop } from 'lodash-es'
import { composeFactory } from './compose/compose-factory'

export const compose = composeFactory({
  argv: __PLATFORM__ === 'node' ? process.argv.slice(2) : [],
  console,
  env: __PLATFORM__ === 'node' ? process.env : {},
  exit: __PLATFORM__ === 'node' ? (code?: number) => process.exit(code) : noop,
})
