import { parse } from '@elodin/parser'

import formatFromAST from './formatFromAST'

export default function format(input, config = {}) {
  const parsed = parse(input)

  if (parsed.errors.length === 0) {
    return formatFromAST(parsed.ast, config)
  }

  return input
}
