import assert from 'node:assert'
import { describe, it } from 'vitest'
import { unquote } from './unquote'

describe('unquote', () => {
  it('should remove matching quotes from a string', () => {
    const quotes = ['"', "'"]
    const input = '\'"hello"\''
    const result = unquote(input, quotes)
    assert.strictEqual(result, 'hello')
  })

  it('should handle nested quotes correctly', () => {
    const quotes = ['"', "'"]
    const input = '"\'hello\'"'
    const result = unquote(input, quotes)
    assert.strictEqual(result, 'hello')
  })

  it('should ignore leading and trailing whitespace', () => {
    const quotes = ['"', "'"]
    const input = "  ' hello '  "
    const result = unquote(input, quotes)
    assert.strictEqual(result, 'hello')
  })

  it('should return the input string if no quotes match', () => {
    const quotes = ['"', "'"]
    const input = 'no quotes'
    const result = unquote(input, quotes)
    assert.strictEqual(result, 'no quotes')
  })

  it('should handle empty strings gracefully', () => {
    const quotes = ['"', "'"]
    const input = ''
    const result = unquote(input, quotes)
    assert.strictEqual(result, '')
  })
})
