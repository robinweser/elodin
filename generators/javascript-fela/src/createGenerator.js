import { getVariablesFromAST, getVariantsFromAST } from '@elodin/utils-core'
import { generateValue, generateModifierMap } from '@elodin/utils-javascript'
import {
  generateMediaQueryFromNode,
  isMediaQuery,
  isPseudoClass,
  isPseudoElement,
} from '@elodin/utils-css'
import { hyphenateProperty } from 'css-in-js-utils'
import uncapitalizeString from 'uncapitalize'
import { arrayReduce, arrayMap } from 'fast-loops'

const defaultConfig = {
  importFrom: 'react-native',
  generateStyleName: styleName => styleName,
  generateFileName: moduleName => moduleName + '.elo',
  generateVariantName: uncapitalizeString,
  generateVariantValue: uncapitalizeString,
}

export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }
  function generate(ast, path = '') {
    const fileName = path.split('/').pop()

    const root = generateRootFile(ast, config)
    const js = generateJSFiles(ast, config, fileName)

    return { [fileName + '.js']: root, ...js }
  }

  generate.filePattern = [config.generateFileName('*') + 'js']

  return generate
}

function generateRootFile(ast, { generateFileName, generateStyleName }) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')

  const imports = styles
    .map(
      module =>
        'import { ' +
        generateStyleName(module.name) +
        " } from './" +
        generateFileName(module.name) +
        ".js'"
    )
    .join('\n')

  return (
    imports +
    '\n\n' +
    'export {\n  ' +
    styles.map(module => generateStyleName(module.name)).join(',\n  ') +
    '\n}'
  )
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

function generateJSFiles(ast, config) {
  const { generateFileName, generateStyleName } = config

  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  return styles.reduce((files, module) => {
    const usedVariants = getVariantsFromAST(module)
    const variantMap = variants.reduce((flatVariants, variant) => {
      if (usedVariants[variant.name]) {
        flatVariants[variant.name] = variant.body.map(
          variation => variation.value
        )
      }

      return flatVariants
    }, {})

    const variables = getVariablesFromAST(module)
    const styles = generateStyles(module.body, variantMap, config)

    files[generateFileName(module.name) + '.js'] =
      'export function ' +
      generateStyleName(module.name) +
      '(props = {}) {\n  return ' +
      stringifyObject(styles, 2, 2) +
      '\n}'

    return files
  }, {})
}

function generateStyles(nodes, variantMap, config) {
  const { generateVariantName, generateVariantValue } = config

  return arrayReduce(
    nodes,
    (styles, node) => {
      if (node.type === 'Declaration') {
        styles[node.property] = generateValue(node.value, node.property, true)
      } else {
        if (node.property.type === 'Identifier') {
          const variant = variantMap[node.property.value]

          if (variant) {
            if (node.value.type === 'Identifier') {
              const variation = variant.indexOf(node.value.value) !== -1

              if (variation) {
                if (!styles.extend) {
                  styles.extend = []
                }

                styles.extend.push({
                  condition:
                    'props.' +
                    generateVariantName(node.property.value) +
                    ' === ' +
                    wrapInString(generateVariantValue(node.value.value)),
                  style: generateStyles(node.body, variantMap, config),
                })
              }
            }
          } else {
            // TODO: throw
          }
        } else if (
          node.property.type === 'Variable' &&
          node.property.environment
        ) {
          const pseudoClass = isPseudoClass(node.property.value)
          const pseudoElement = isPseudoElement(node.property.value)
          const mediaQuery = isMediaQuery(node.property.value)

          if ((pseudoClass || pseudoElement) && node.boolean) {
            const key =
              (pseudoElement ? '::' : ':') +
              hyphenateProperty(node.property.value)

            styles[key] = generateStyles(node.body, variantMap, config)
          }

          if (mediaQuery) {
            const key = generateMediaQueryFromNode(
              node.boolean ? undefined : node.value.value,
              node.property.value,
              node.operator
            )
            styles['@media ' + key] = generateStyles(
              node.body,
              variantMap,
              config
            )
          }
        }
      }

      return styles
    },
    {}
  )
}

function stringifyObject(obj, indent = 2, startIndent = 0) {
  const fullIndent = indent + startIndent

  const items = arrayMap(Object.keys(obj), property => {
    const value = obj[property]

    const prefix =
      ' '.repeat(fullIndent) +
      (property.match(/^[a-z]+/) !== null ? property : wrapInString(property)) +
      ': '

    if (Array.isArray(value)) {
      return (
        prefix +
        '[\n' +
        ' '.repeat(fullIndent + 2) +
        value
          .map(val => stringifyObject(val, indent + 2 + 2, startIndent))
          .join(',\n' + ' '.repeat(fullIndent + 2)) +
        '\n' +
        ' '.repeat(fullIndent) +
        ']'
      )
    }

    if (typeof value === 'object') {
      return prefix + stringifyObject(value, indent + 2, startIndent)
    }

    return prefix + obj[property]
  })

  return '{\n' + items.join(',\n') + '\n' + ' '.repeat(indent) + '}'
}

function wrapInString(value) {
  return '"' + value + '"'
}
