// this is a basic powerset function
export default function getValueCombinations(...array) {
  // O(2^n)
  const results = [[]]
  for (const value of array) {
    const copy = [...results] // See note below.
    for (const prefix of copy) {
      results.push(prefix.concat(value))
    }
  }
  return results
}
