// import { Context } from './types'

export class CliError extends Error {
  constructor(m: string) {
    super(m)

    Object.setPrototypeOf(this, CliError.prototype)
  }
}

// export const error = (message: string, context: Context): never => {
//   const fn = async () => {
//     await context.console.error(message)
//     await context.exit(1)
//   }

//   void fn()

//   throw new Error(message)
// }
