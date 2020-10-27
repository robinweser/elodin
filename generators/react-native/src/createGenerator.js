import { getVariablesFromAST } from '@elodin/utils-core'
import { generateValue } from '@elodin/utils-javascript'
import { hyphenateProperty } from 'css-in-js-utils'
import uncapitalizeString from 'uncapitalize'

const defaultConfig = {
  importFrom: 'react-native',
  generateJSFileName: (moduleName) => moduleName + '.elo',
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

  generate.filePattern = [config.generateJSFileName('*') + 'js']

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
  const styles = ast.body.filter((node) => node.type === 'Style')

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
        (name) =>
          uncapitalizeString(name) +
          ': {\n    ' +
          modules[name].style
            .filter((decl) => !decl.dynamic)
            .map(stringifyDeclaration)
            .join(',\n    ') +
          '\n  }'
      )
      .join(',\n  ') +
    '\n})' +
    '\n\n' +
    Object.keys(modules)
      .map(
        (name) =>
          'export function ' +
          name +
          '(props = {}) {\n  ' +
          (modules[name].style.find((decl) => decl.dynamic)
            ? 'const style = {\n    ' +
              modules[name].style
                .filter((decl) => decl.dynamic)
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
  const base = nodes.filter((node) => node.type === 'Declaration')

  return base.map((declaration) => ({
    property: declaration.property,
    value: generateValue(declaration.value, declaration.property, true),
    dynamic: declaration.dynamic,
  }))
}
