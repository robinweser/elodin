import { getVariablesFromAST, getVariantsFromAST } from '@elodin/utils-core'
import { generateValue, generateModifierMap } from '@elodin/utils-javascript'
import { hyphenateProperty } from 'css-in-js-utils'
import uncapitalizeString from 'uncapitalize'

const defaultConfig = {
  importFrom: 'react-native',
  generateJSFileName: (moduleName) => moduleName + '.elo',
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

function generateJS(
  ast,
  { importFrom, devMode, generateVariantValue, generateVariantName }
) {
  const styles = ast.body.filter((node) => node.type === 'Style')
  const variants = ast.body.filter((node) => node.type === 'Variant')

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
    const styles = generateStyles(module.body, variantMap, devMode)

    const modifierStyle = styles.filter((style) => style.modifier.length !== 0)
    const baseStyle = styles.filter((style) => style.modifier.length === 0)[0]

    console.log(modifierStyle)

    modules[module.name] = {
      baseStyle,
      modifierStyle,
      variables,
    }
    return modules
  }, {})

  return Object.keys(modules)
    .map(
      (name) =>
        'export function ' +
        name +
        '(props = {}) {\n  return {\n    ' +
        modules[name].baseStyle.declarations
          .map(stringifyDeclaration)
          .join(',\n    ') +
        (modules[name].modifierStyle.length > 0
          ? ',\n    extend: [\n      ' +
            modules[name].modifierStyle
              .map(
                ({ modifier, declarations }) =>
                  '{\n        ' +
                  'condition: ' +
                  modifier
                    .map(
                      ([name, value]) =>
                        'props.' +
                        generateVariantName(name) +
                        ' === ' +
                        wrapInString(generateVariantValue(value))
                    )
                    .join(' && ') +
                  ',\n        style: {\n          ' +
                  declarations.map(stringifyDeclaration).join(',\n          ') +
                  '\n        }' +
                  '\n      }'
              )
              .join(',\n      ') +
            '\n    ]'
          : '') +
        '\n  }' +
        '\n}'
    )
    .join('\n\n')
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

  styles.push({
    modifier,
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

function wrapInString(value) {
  return '"' + value + '"'
}
