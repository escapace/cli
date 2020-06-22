/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  FluentInterface,
  Model,
  log,
  state,
  SYMBOL_LOG,
  SYMBOL_STATE
} from '@escapace/fluent'

import { isObject, isArray } from 'lodash-es'

// TODO: move this into @escapace/fluent

export type FunctionalFluentInterface<
  I extends FluentInterface<Model<any, any>>
> = I extends FluentInterface<Model<infer U, infer T>>
  ? FluentInterface<Model<U, T>>
  : never

export const extract = <I extends FluentInterface<Model<any, any>>>(
  object: I,
  validate = false
): FunctionalFluentInterface<I> => {
  if (validate) {
    const condition =
      isObject(object) &&
      isArray(object[SYMBOL_LOG]) &&
      isObject(object[SYMBOL_STATE])

    if (!condition) {
      throw new Error('Argument Error')
    }
  }

  return {
    [SYMBOL_STATE]: state(object),
    [SYMBOL_LOG]: log(object)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}
