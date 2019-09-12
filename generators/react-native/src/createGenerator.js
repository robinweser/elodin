import { uncapitalizeString } from '@elodin/utils'
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

  return prop + (declaration.dynamic ? 'props.' : '') + declaration.value
}

function generateValue(value, property) {
  if (value.type === 'Variable') {
    return value.value
  }

  if (value.type === 'Integer') {
    return (value.negative ? '-' : '') + value.value
  }

  if (value.type === 'RawValue' || value.type === 'String') {
    return '"' + value.value + '"'
  }

  if (value.type === 'Percentage') {
    if (property === 'opacity') {
      return value.value / 100
    } else {
      return '"' + value.value + '%"'
    }
  }

  if (value.type === 'Color') {
    const { format, red, blue, green, alpha } = value

    const colorValue = color.rgb(red, green, blue, alpha)
    if (format === 'hex') {
      return '"#' + colorValue.hex() + '"'
    }

    if (format === 'keyword') {
      // TODO: check APIs
      return '"' + colorValue.keyword() + '"'
    }

    return '"' + colorValue[format]().string() + '"'
  }

  if (value.type === 'Float') {
    return (value.negative ? '-' : '') + value.integer + '.' + value.fractional
  }

  if (value.type === 'Identifier') {
    return '"' + hyphenateProperty(value.value) + '"'
  }

  return '"' + value.value + '"'
}

function generateJS(ast, config) {
  const styles = ast.body.filter(node => node.type === 'Style')

  const modules = styles.reduce((modules, module) => {
    const style = generateStyle(module.body)
    modules[module.name] = style
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
          modules[name]
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
          (modules[name].find(decl => decl.dynamic)
            ? 'const style = {\n    ' +
              modules[name]
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

  return base.map(declaration => ({
    property: declaration.property,
    value: generateValue(declaration.value, declaration.property),
    dynamic: declaration.dynamic,
  }))
}
