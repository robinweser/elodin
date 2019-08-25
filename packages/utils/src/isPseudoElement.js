const validPseudoElements = {
  before: true,
  after: true,
  firstLine: true,
  firstLetter: true,
  selection: true,
}

export default function isPseudoElement(str) {
  return validPseudoElements[str]
}
