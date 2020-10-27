import { parse } from '@elodin/parser'
import * as types from '@elodin/types'

import traverse from './traverse'

const elodinInterface = {
  parse,
  traverse,
  types,
}

export default function normalizeVisitors(visitors) {
  return visitors.reduce((normalizedVisitors, visitor) => {
    const resolvedVisitor =
      typeof visitor === 'function' ? visitor(elodinInterface) : visitor

    Object.keys(resolvedVisitor).forEach((nodeType) => {
      const normalizedVisitor = resolvedVisitor[nodeType]

      if (typeof normalizedVisitor === 'function') {
        resolvedVisitor[nodeType] = {
          enter(path) {
            normalizedVisitor(path)
          },
        }
      }
    })

    normalizedVisitors.push(resolvedVisitor)
    return normalizedVisitors
  }, [])
}
