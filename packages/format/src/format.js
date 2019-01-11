import { parse } from '@elodin/parser'

import formatFromAST from './formatFromAST'

export default function format(input, config = {}) {
  return formatFromAST(parse(input), config)
}
