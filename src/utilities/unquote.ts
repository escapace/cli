export const trimWhitespace = (value: string): string => value.replace(/^\p{Z}+|\p{Z}+$/gu, '')

export function unquote(input: string, quotes: string[]): string {
  let result = trimWhitespace(input)

  // eslint-disable-next-line typescript/no-loop-func
  while (quotes.some((quote) => result.startsWith(quote) && result.endsWith(quote))) {
    result = trimWhitespace(result.slice(1, -1))
  }

  return result
}
