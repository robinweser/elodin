import { hyphenateProperty } from 'css-in-js-utils'
import { generateValue as generateCSSValue } from '@elodin/utils-css'

const inlineFns = {
  add: ' + ',
  sub: ' - ',
  mul: ' * ',
  div: ' / ',
  percentage: true,
}

const stringFns = {
  rgb: true,
  rgba: true,
  hsl: true,
  hsla: true,
}

export default function generateValue(node, property, dynamic = true) {
  const floatingPercentage = property === 'opacity'

  if (!dynamic) {
    return wrapInString(generateCSSValue(node, property))
  }

  if (node.type === 'FunctionExpression') {
    return generateFunction(node, property, floatingPercentage)
  }

  if (node.type === 'Integer') {
    return (node.negative ? '-' : '') + node.value
  }

  if (node.type === 'Float') {
    return (node.negative ? '-' : '') + node.integer + '.' + node.fractional
  }

  if (node.type === 'Identifier') {
    return wrapInString(hyphenateProperty(node.value))
  }
  if (node.type === 'String') {
    return wrapInString(node.value)
  }

  if (node.type === 'Variable') {
    return 'props.' + node.value
  }

  return node.value
}

function generateFunction(node, property, floatingPercentage = false) {
  if (stringFns[node.callee]) {
    return wrapInString(
      node.callee +
        '(' +
        node.params
          .map((param) => {
            if (param.type === 'Variable') {
              return '" + props.' + param.value + ' + "'
            }

            if (
              param.type === 'FunctionExpression' &&
              inlineFns[param.callee]
            ) {
              return '" + ' + generateValue(param, property) + ' + "'
            }

            return generateValue(param, property)
          })
          .join(', ') +
        ')'
    )
  }

  if (node.callee === 'percentage') {
    if (floatingPercentage) {
      return '((' + generateValue(node.params[0], property) + ') / 100)'
    }

    return '(' + generateValue(node.params[0], property) + ') + "%"'
  }

  if (node.callee === 'raw') {
    return generateValue(node.params[0], property)
  }

  if (inlineFns[node.callee]) {
    return wrapInParens(
      node.params
        .map((value) => generateValue(value, property))
        .join(inlineFns[node.callee])
    )
  }
}

function wrapInString(value) {
  return '"' + value + '"'
}

function wrapInParens(value) {
  return '(' + value + ')'
}
