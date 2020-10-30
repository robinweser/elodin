import { getVariablesFromAST, getVariantsFromAST } from '@elodin/utils-core'
import { generateValue, generateModifierMap } from '@elodin/utils-javascript'
import { hyphenateProperty } from 'css-in-js-utils'
import uncapitalizeString from 'uncapitalize'

const defaultConfig = {
  importFrom: 'react-native',
  generateFileName: (moduleName) => moduleName + '.elo',
  generateVariantName: uncapitalizeString,
  generateVariantValue: uncapitalizeString,
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

  generate.filePattern = [config.generateFileName('*') + 'js']

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

function generateJS(
  ast,
  { importFrom, devMode, generateVariantValue, generateVariantName }
) {
  const styles = ast.body.filter((node) => node.type === 'Style')
  const variants = ast.body.filter((node) => node.type === 'Variant')

  let modifierMap = {}
  const modules = styles.reduce((modules, module) => {
    const usedVariants = getVariantsFromAST(module)
    const variantMap = variants.reduce((flatVariants, variant) => {
      if (usedVariants[variant.name]) {
        flatVariants[variant.name] = variant.body.map(
          (variation) => variation.value
        )
      }

      return flatVariants
    }, {})

    const variables = getVariablesFromAST(module)
    const style = generateStyle(module.body)
    const styles = generateStyles(module.body, variantMap, devMode)

    modifierMap = {
      ...modifierMap,
      ...generateModifierMap(module.body, variantMap, {
        devMode,
        generateVariantName,
        generateVariantValue,
        valueSeparator: '_',
        variantSeparator: '__',
      }),
    }

    modules[module.name] = {
      style,
      styles,
      variables,
    }
    return modules
  }, {})

  return (
    'import { StyleSheet } from "' +
    importFrom +
    '"' +
    '\n\n' +
    'const styles = StyleSheet.create({\n  ' +
    Object.keys(modules)
      .map((name) =>
        modules[name].styles
          .map(
            ({ modifier, declarations }) =>
              uncapitalizeString(name) +
              modifier +
              ': {\n    ' +
              declarations
                .filter((decl) => !decl.dynamic)
                .map(stringifyDeclaration)
                .join(',\n    ') +
              '\n  }'
          )
          .join(',\n  ')
      )
      .join(',\n  ') +
    '\n})' +
    '\n\n' +
    'const modifierMap = ' +
    JSON.stringify(modifierMap, null, 2) +
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

function generateStyles(
  nodes,
  variantMap,
  devMode,
  styles = [],
  modifier = []
) {
  const base = nodes.filter((node) => node.type === 'Declaration')
  const nesting = nodes.filter((node) => node.type !== 'Declaration')
  const variantOrder = Object.keys(variantMap)

  styles.push({
    // ensure the variant modifier order is always deterministic
    modifier: modifier
      .sort((a, b) =>
        variantOrder.indexOf(a[0]) > variantOrder.indexOf(b[0]) ? 1 : -1
      )
      .map(([name, value]) =>
        devMode
          ? '___' + name + '_' + value
          : '__' +
            variantOrder.indexOf(name) +
            '_' +
            variantMap[name].indexOf(value)
      )
      .join(''),
    declarations: base.map((declaration) => ({
      property: declaration.property,
      value: generateValue(declaration.value, declaration.property, true),
      dynamic: declaration.dynamic,
    })),
  })

  nesting.forEach((nest) => {
    if (nest.property.type === 'Identifier') {
      const variant = variantMap[nest.property.value]

      if (variant) {
        if (nest.value.type === 'Identifier') {
          const variation = variant.indexOf(nest.value.value) !== -1

          if (variation) {
            generateStyles(nest.body, variantMap, devMode, styles, [
              ...modifier,
              [nest.property.value, nest.value.value],
            ])
          }
        }
      } else {
        // TODO: throw
      }
    }
  })

  return styles
}
