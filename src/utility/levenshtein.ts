export const levenshtein = (a: string, b: string): number => {
  if (a.length === 0) {
    return b.length
  }
  if (b.length === 0) {
    return a.length
  }
  const matrix = new Array<number[]>(b.length + 1)
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = new Array<number>(a.length + 1)
    matrix[i][0] = i
  }
  for (let i = 1; i <= b.length; ++i) {
    for (let j = 1; j <= a.length; ++j) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1], // substitution
              matrix[i][j - 1], // insertion
              matrix[i - 1][j] // deletion
            ) + 1
    }
  }
  return matrix[b.length][a.length]
}
