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
          '(' +
          (modules[name].variables.length > 0
            ? '{ ' + modules[name].variables.join(', ') + ' }'
            : '') +
          ') {\n  ' +
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
    value: generateValue(declaration.value, declaration.property),
    dynamic: declaration.dynamic,
  }))
}

function wrapInString(value) {
  return '"' + value + '"'
}

const inlineFns = {
  add: true,
  sub: true,
  mul: true,
  div: true,
  percentage: true,
}

const stringFns = {
  rgb: true,
  rgba: true,
  hsl: true,
  hsla: true,
}

function generateFunction(node) {
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
              return '" + (' + generateValue(param) + ') + "'
            }
            return generateValue(param)
          })
          .join(', ') +
        ')'
    )
  }

  if (node.callee === 'percentage') {
    return '(' + generateValue(node.params[0]) + ') + "%"'
  }

  if (node.callee === 'raw') {
    return wrapInString(generateValue(node.params[0]))
  }

  if (node.callee === 'add') {
    return node.params.map(generateValue).join(' + ')
  }

  if (node.callee === 'sub') {
    return node.params.map(generateValue).join(' - ')
  }

  if (node.callee === 'mul') {
    return node.params.map(generateValue).join(' * ')
  }

  // if (math[node.callee]) {
  //   return generateValue({
  //     type: 'Integer',
  //     value: resolveMath(value),
  //   })
  // }
}

function generateValue(node) {
  if (node.type === 'FunctionExpression') {
    return generateFunction(node)
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
    return node.value
  }

  return wrapInString(node.value)
}
