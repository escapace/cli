/* eslint-disable typescript/no-unsafe-assignment */
/* eslint-disable typescript/no-unsafe-return */
import {
  type FluentInterface,
  log,
  type Model,
  state,
  SYMBOL_LOG,
  SYMBOL_STATE,
} from '@escapace/fluent'

import { isArray, isObject } from 'lodash-es'

// TODO: move this into @escapace/fluent
type FunctionalFluentInterface<I extends FluentInterface<Model>> =
  I extends FluentInterface<Model<infer U, infer T>> ? FluentInterface<Model<U, T>> : never

export const extract = <I extends FluentInterface<Model>>(
  object: I,
  validate = false,
): FunctionalFluentInterface<I> => {
  if (validate) {
    const condition =
      isObject(object) && isArray(object[SYMBOL_LOG]) && isObject(object[SYMBOL_STATE])

    if (!condition) {
      throw new Error('Argument Error')
    }
  }

  return {
    [SYMBOL_LOG]: log(object),
    [SYMBOL_STATE]: state(object),
  } as any
}
