export const levenshtein = (a: string, b: string): number => {
  if (a.length === 0) {
    return b.length
  }
  if (b.length === 0) {
    return a.length
  }
  const matrix = new Array<number[]>(b.length + 1)
  for (let index = 0; index <= b.length; index++) {
    matrix[index] = new Array<number>(a.length + 1)
    matrix[index][0] = index
  }
  for (let index = 1; index <= b.length; ++index) {
    for (let index_ = 1; index_ <= a.length; ++index_) {
      matrix[index][index_] =
        b[index - 1] === a[index_ - 1]
          ? matrix[index - 1][index_ - 1]
          : Math.min(
              matrix[index - 1][index_ - 1], // substitution
              matrix[index][index_ - 1], // insertion
              matrix[index - 1][index_], // deletion
            ) + 1
    }
  }
  return matrix[b.length][a.length]
}
