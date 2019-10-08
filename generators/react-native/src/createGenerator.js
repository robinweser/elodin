import { uncapitalizeString, getVariablesFromAST } from '@elodin/utils'
import { hyphenateProperty } from 'css-in-js-utils'
import color from 'color'

const defaultConfig = {
  importFrom: 'react-native',
}

export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }
  function generate(ast, fileName = '') {
    const js = generateJS(ast, config)

    return { [fileName + '.js']: js }
  }

  generate.filePattern = ['*.elo.js']
  generate.ignorePattern = ['node_modules']

  return generate
}

function stringifyDeclaration(declaration) {
  const prop = declaration.property + ': '

  if (typeof declaration.value === 'object') {
    return (
      prop + '{' + declaration.value.map(stringifyDeclaration).join(',\n') + '}'
    )
  }

  return prop + declaration.value
}

function generateJS(ast, config) {
  const styles = ast.body.filter(node => node.type === 'Style')

  const modules = styles.reduce((modules, module) => {
    const variables = getVariablesFromAST(module)
    const style = generateStyle(module.body)
    modules[module.name] = { style, variables }
    return modules
  }, {})

  return (
    'import { StyleSheet } from "' +
    config.importFrom +
    '"' +
    '\n\n' +
    'const styles = StyleSheet.create({\n  ' +
    Object.keys(modules)
      .map(
        name =>
          uncapitalizeString(name) +
          ': {\n    ' +
          modules[name].style
            .filter(decl => !decl.dynamic)
            .map(stringifyDeclaration)
            .join(',\n    ') +
          '\n  }'
      )
      .join(',\n  ') +
    '\n})' +
    '\n\n' +
    Object.keys(modules)
      .map(
        name =>
          'export function ' +
          name +
          '(props = {}) {\n  ' +
          (modules[name].style.find(decl => decl.dynamic)
            ? 'const style = {\n    ' +
              modules[name].style
                .filter(decl => decl.dynamic)
                .map(stringifyDeclaration)
                .join(',\n    ') +
              '\n  }\n\n  ' +
              'return StyleSheet.flatten([styles.' +
              uncapitalizeString(name) +
              ', style])'
            : 'return styles.' + uncapitalizeString(name)) +
          '\n}'
      )
      .join('\n\n')
  )
}

function generateStyle(nodes) {
  const base = nodes.filter(node => node.type === 'Declaration')
  getVariablesFromAST

  return base.map(declaration => ({
    property: declaration.property,
    value: generateValue(declaration.value, declaration.property === 'opacity'),
    dynamic: declaration.dynamic,
  }))
}

function wrapInString(value) {
  return '"' + value + '"'
}

function wrapInParens(value) {
  return '(' + value + ')'
}

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

function generateFunction(node, floatingPercentage = false) {
  if (stringFns[node.callee]) {
    return wrapInString(
      node.callee +
        '(' +
        node.params
          .map(param => {
            if (
              param.type === 'Variable' ||
              (param.type === 'FunctionExpression' && inlineFns[param.callee])
            ) {
              return '" + ' + wrapInParens(generateValue(param, true)) + ' + "'
            }
            return generateValue(param, true)
          })
          .join(', ') +
        ')'
    )
  }

  if (node.callee === 'percentage') {
    if (floatingPercentage) {
      return wrapInParens(
        generateValue(node.params[0], floatingPercentage) + ' / 100'
      )
    }

    return '(' + generateValue(node.params[0], floatingPercentage) + ') + "%"'
  }

  if (node.callee === 'raw') {
    return wrapInString(generateValue(node.params[0], floatingPercentage))
  }

  if (inlineFns[node.callee]) {
    return wrapInParens(
      node.params
        .map(value => generateValue(value, floatingPercentage))
        .join(inlineFns[node.callee])
    )
  }

  // if (math[node.callee]) {
  //   return generateValue({
  //     type: 'Integer',
  //     value: resolveMath(value),
  //   })
  // }
}

function generateValue(node, floatingPercentage = false) {
  if (node.type === 'FunctionExpression') {
    return generateFunction(node, floatingPercentage)
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

  if (node.type === 'Variable') {
    return 'props.' + node.value
  }

  return wrapInString(node.value)
}
