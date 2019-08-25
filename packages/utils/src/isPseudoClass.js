// still missing some special onces
const validPseudoClasses = {
  link: true,
  hover: true,
  focus: true,
  active: true,
  visited: true,
  checked: true,
  default: true,
  empty: true,
  enabled: true,
  first: true,
  disabled: true,
  focusWithin: true,
  firstChild: true,
  lastChild: true,
  firstOfType: true,
  intermediate: true,
  inRange: true,
  invalid: true,
  lastOfType: true,
  left: true,
  onlyChild: true,
  onlyOfType: true,
  optional: true,
  readOnly: true,
  readWrite: true,
  required: true,
  right: true,
  target: true,
  valid: true,
  visited: true,
}

export default function isPseudoClass(str) {
  return validPseudoClasses[str]
}
