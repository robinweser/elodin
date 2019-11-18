import {
  capitalizeString,
  uncapitalizeString,
  isPseudoClass,
  isPseudoElement,
  isMediaQuery,
  getArrayCombinations,
  getValueCombinations,
  getModuleName,
  stringifyCSSRule,
  getVariablesFromAST,
  getVariantsFromAST,
  escapeKeywords,
  generateCSSMediaQueryFromNode,
  generateCSSClasses,
  generateCSSValue,
} from '@elodin/utils'
import { hyphenateProperty } from 'css-in-js-utils'

import keywords from './keywords'

const defaultConfig = {
  devMode: false,
  dynamicImport: false,
  extractCSS: true,
  generateStyleName: styleName => styleName,
  generateCSSFileName: (moduleName, styleName) =>
    capitalizeString(moduleName) + styleName + '.elo',
  generateReasonFileName: fileName => capitalizeString(fileName) + 'Style',
}

export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  function generate(ast, path = '') {
    const fileName = path
      .split('/')
      .pop()
      .replace(/[.]elo/gi, '')
      .split('.')
      .map(capitalizeString)
      .join('')

    const escapedAst = escapeKeywords(ast, keywords)
    const css = config.extractCSS
      ? generateCSSFiles(escapedAst, config, fileName)
      : {}
    const reason = generateReasonFile(escapedAst, config, fileName)

    return {
      ...css,
      ...reason,
    }
  }

  generate.filePattern = [
    config.generateReasonFileName('*') + '.re',
    config.generateReasonFileName('*') + '.bs.js',
    config.generateCSSFileName('*', '') + '.css',
  ]

  generate.ignorePattern = ['node_modules']

  return generate
}

function generateReasonFile(ast, config, fileName) {
  const {
    devMode,
    generateReasonFileName,
    generateCSSFileName,
    dynamicImport,
    extractCSS,
  } = config
  const moduleName = generateReasonFileName(fileName)

  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  const imports = extractCSS
    ? styles.reduce((imports, module) => {
        imports.push(
          'require("./' + generateCSSFileName(fileName, module.name) + '.css")'
        )
        return imports
      }, [])
    : []

  const modules = generateModules(ast, config, fileName)

  const variantMap = variants.reduce((flatVariants, variant) => {
    flatVariants[variant.name] = variant.body.map(variation => variation.value)

    return flatVariants
  }, {})

  const allVariables = getVariablesFromAST(ast)
  const variantTypes = Object.keys(variantMap)
    .map(
      variant =>
        '[@bs.deriving jsConverter]\n' +
        `type ` +
        variant.toLowerCase() +
        ` =\n  ` +
        variantMap[variant].map(val => '| ' + val).join('\n  ') +
        ';'
    )
    .join('\n\n')

  return {
    [moduleName + '.re']:
      'open Fela;\n\n' +
      `type extend;\nexternal extend: Js.t('a) => extend = "%identity";\n\n` +
      (!dynamicImport && imports.length > 0
        ? imports.map(file => '[%bs.raw {| ' + file + ' |}];').join('\n') +
          '\n\n'
        : '') +
      (variantTypes ? variantTypes + '\n\n' : '') +
      modules.join('\n\n'),
  }
}

function generateCSSFiles(
  ast,
  { devMode, generateReasonFileName, generateCSSFileName },
  fileName
) {
  // TODO: include fragments
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

    const classes = generateCSSClasses(module.body, variantMap, devMode)

    files[generateCSSFileName(fileName, module.name) + '.css'] = classes
      .filter(selector => selector.declarations.length > 0)
      .map(selector => {
        const css = stringifyCSSRule(
          selector.declarations,
          getModuleName(module, devMode) + selector.modifier + selector.pseudo,
          selector.media ? '  ' : ''
        )

        if (selector.media) {
          return '@media ' + selector.media + ' {\n' + css + '\n}'
        }

        return css
      })
      .join('\n\n')

    return files
  }, {})
}

function generateModules(
  ast,
  {
    devMode,
    dynamicImport,
    extractCSS,
    viewBaseClassName,
    textBaseClassName,
    generateStyleName,
    generateCSSFileName,
  },
  fileName
) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  const variantMap = variants.reduce((flatVariants, variant) => {
    flatVariants[variant.name] = variant.body.map(variation => variation.value)

    return flatVariants
  }, {})
  const variantOrder = Object.keys(variantMap)

  return styles.reduce((rules, module) => {
    const out = generateStyle(module.body, extractCSS, {})

    const variables = getVariablesFromAST(module)
    const variantStyleMap = generateVariantStyleMap(
      module.body,
      variants,
      extractCSS
    )

    const usedVariants = getVariantsFromAST(module)
    const variantNames = Object.keys(usedVariants).sort((x, y) =>
      variantOrder.indexOf(x) > variantOrder.indexOf(y) ? 1 : -1
    )

    const params = [...variables, ...variantNames]
    const baseClassName =
      (module.format === 'view' && viewBaseClassName) ||
      (module.format === 'text' && textBaseClassName)

    const className =
      (baseClassName ? baseClassName + (extractCSS ? ' ' : '') : '') +
      (extractCSS ? getModuleName(module, devMode) : '')

    let variantSwitch = ''

    if (variantNames.length > 0) {
      const combinations = getArrayCombinations(
        ...variantNames.map(variant => [...variantMap[variant], 'None'])
      )

      const combis = combinations.reduce((matches, combination) => {
        let vari = variantStyleMap
          .map(vari => {
            if (
              Object.keys(vari.variants).reduce((match, variant) => {
                let index = variantNames.indexOf(variant)
                return match && combination[index] === vari.variants[variant]
              }, true)
            ) {
              return vari
            }
          })
          .filter(Boolean)

        if (vari) {
          matches.push({
            combination,
            style: vari.map(vari =>
              Object.keys(vari.variants)
                .map(variant => vari.variants[variant])
                .join('')
            ),
          })
        }
        return matches
      }, [])

      variantSwitch = `let get${module.name}Variants = (${variantNames
        .map(variant => '~' + variant.toLowerCase())
        .join(', ')}, ()) => {
  switch (${variantNames.map(v => v.toLowerCase()).join(', ')}) {
    ${combinations
      // .filter(combination => combination.find(comp => comp !== 'None'))
      .map(
        combination =>
          '| (' +
          combination
            .map(comb => (comb === 'None' ? 'None' : 'Some(' + comb + ')'))
            .join(', ') +
          ') => "' +
          (combination.find(val => val !== 'None') &&
          combination.reduce(
            (hasCombination, value, index) =>
              value === 'None' ||
              usedVariants[variantNames[index]].indexOf(value) !== -1 ||
              hasCombination,
            false
          )
            ? ' ' +
              getModuleName(module, devMode) +
              getValueCombinations(
                ...combination
                  .map((comb, index) =>
                    comb === 'None'
                      ? ''
                      : devMode
                      ? '__' + variantNames[index] + '-' + comb
                      : '_' +
                        index +
                        '-' +
                        variantMap[variantNames[index]].indexOf(comb)
                  )
                  .filter(val => val !== '')
              )
                .filter(set => set.length > 0)
                .map(set => set.join(''))
                .join(' ' + getModuleName(module, devMode))
            : '') +
          '"'
      )
      .join('\n    ')}\n  }
};`
    }

    const style =
      '  style({\n' +
      (className || (variantSwitch && extractCSS) ? '    "_className": ' : '') +
      (className ? wrapInString(className) : '') +
      (variantSwitch && extractCSS
        ? (className ? ' ++ ' : '') +
          'get' +
          module.name +
          'Variants(' +
          variantNames.map(n => '~' + uncapitalizeString(n)).join(', ') +
          ', ()),\n'
        : className
        ? ',\n'
        : '') +
      stringifyStyle(out) +
      '  })'

    const rule =
      'let ' +
      uncapitalizeString(generateStyleName(module.name)) +
      ' = (' +
      (params.length > 0
        ? params.map(name => '~' + uncapitalizeString(name) + '=?').join(', ') +
          ', ()'
        : '') +
      ') => {\n' +
      (dynamicImport && extractCSS
        ? '  [%bs.raw {| import("./' +
          generateCSSFileName(fileName, module.name) +
          '.css") |}];\n\n'
        : '') +
      style +
      '\n};'

    rules.push(
      (variantSwitch && extractCSS ? variantSwitch + '\n\n' : '') + rule
    )

    return rules
  }, [])
}

function stringifyStyle(style, out = '', level = 2) {
  Object.keys(style).map(property => {
    const value = style[property]

    if (typeof value === 'object') {
      // handle extend
      if (Array.isArray(value)) {
        out +=
          '  '.repeat(level) +
          wrapInString(property) +
          ': ' +
          '[|' +
          value
            .map(
              extension =>
                '{\n' +
                stringifyStyle(extension, '', level + 1) +
                '  '.repeat(level) +
                '}'
            )
            .join(',') +
          '|],' +
          '\n'
      } else {
        if (property === 'style') {
          out +=
            '  '.repeat(level) +
            wrapInString(property) +
            ': ' +
            'extend({\n' +
            stringifyStyle(value, '', level + 1) +
            '  '.repeat(level) +
            '}),\n'
        } else {
          out +=
            '  '.repeat(level) +
            wrapInString(property) +
            ': ' +
            '{\n' +
            stringifyStyle(value, '', level + 1) +
            '  '.repeat(level) +
            '},\n'
        }
      }
    } else {
      out += '  '.repeat(level) + wrapInString(property) + ': ' + value + ',\n'
    }
  })

  return out
}

function generateStyle(nodes, extractCSS, style = {}) {
  nodes.map(node => {
    if (node.type === 'Declaration' && (node.dynamic || !extractCSS)) {
      style[node.property] = generateValue(
        node.value,
        node.property,
        node.dynamic
      )
    }

    if (node.type === 'Conditional') {
      if (node.property.type === 'Variable' && node.property.environment) {
        if (
          node.boolean &&
          (isPseudoClass(node.property.value) ||
            isPseudoElement(node.property.value))
        ) {
          const nested = generateStyle(node.body, extractCSS)

          if (Object.keys(nested).length > 0) {
            style[
              (isPseudoElement(node.property.value) ? '::' : ':') +
                hyphenateProperty(node.property.value)
            ] = nested
          }
        }

        if (isMediaQuery(node.property.value)) {
          const nested = generateStyle(node.body, extractCSS)

          if (Object.keys(nested).length > 0) {
            style[
              '@media ' +
                generateCSSMediaQueryFromNode(
                  node.boolean ? undefined : node.value.value,
                  node.property.value,
                  node.operator
                )
            ] = nested
          }
        }
      } else {
        if (
          node.property.type === 'Identifier' &&
          node.value.type === 'Identifier' &&
          node.operator === '='
        ) {
          if (!style.extend) {
            style.extend = []
          }

          const nested = generateStyle(node.body, extractCSS)

          if (Object.keys(nested).length > 0) {
            style.extend.push({
              condition:
                uncapitalizeString(node.property.value) +
                ' === Some(' +
                node.value.value +
                ')',
              style: nested,
            })
          }

          if (style.extend.length === 0) {
            delete style.extend
          }
        }
      }
    }
  })

  return style
}

function generateVariantStyleMap(
  nodes,
  variants,
  extractCSS,
  styles = [],
  style = [],
  modifier = {}
) {
  const nesting = nodes.filter(node => node.type !== 'Declaration')
  const variantOrder = variants.map(variant => variant.name)

  if (style.length > 0) {
    styles.push({ style, variants: modifier })
  }

  nesting.forEach(nest => {
    if (nest.property.type === 'Identifier') {
      const variant = variants.find(
        variant => variant.name === nest.property.value
      )

      if (variant) {
        if (nest.value.type === 'Identifier') {
          const variation = variant.body.find(
            variant => variant.value === nest.value.value
          )

          if (variation) {
            generateVariantStyleMap(
              nest.body,
              variants,
              extractCSS,
              styles,
              generateStyle(nest.body, extractCSS),
              {
                ...modifier,
                [variant.name]: variation.value,
              }
            )
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
              return (
                '" ++ string_of_int(' + generateValue(param, true) + ') ++ "'
              )
            }

            return generateValue(param, true)
          })
          .join(', ') +
        ')'
    )
  }

  if (node.callee === 'percentage') {
    if (floatingPercentage) {
      return (
        'string_of_int((' +
        generateValue(node.params[0], floatingPercentage) +
        ') / 100)'
      )
    }

    return (
      'string_of_int(' +
      generateValue(node.params[0], floatingPercentage) +
      ') ++ "%"'
    )
  }

  if (node.callee === 'raw') {
    return generateValue(node.params[0], floatingPercentage)
  }

  if (inlineFns[node.callee]) {
    return wrapInParens(
      node.params
        .map(value => generateValue(value, floatingPercentage, true))
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

function generateValue(node, property, dynamic) {
  const floatingPercentage = property === 'opacity'

  if (!dynamic) {
    return wrapInString(generateCSSValue(node, property))
  }

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
    return hyphenateProperty(node.value)
  }

  return node.value
}
