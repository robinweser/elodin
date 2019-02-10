import { parse } from '@elodin/parser'

import formatFromAST from './formatFromAST'

export default function format(input, config = {}) {
  const parsed = parse(input, config)

  if (parsed.errors.length === 0) {
    return {
      code: formatFromAST(parsed.ast, config),
      errors: [],
    }
  }

  return {
    code: input,
    errors: parsed.errors,
  }
}
