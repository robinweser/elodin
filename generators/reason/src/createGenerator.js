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
import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'

import keywords from './keywords'
import { baseReset, rootReset } from './getReset'
import stringifyDeclaration from './stringifyDeclaration'

const defaultConfig = {
  devMode: false,
  dynamicImport: false,
  extractCss: true,
  generateResetClassName: type => '_elo_' + type,
  generateFileName: (fileName, moduleName) =>
    capitalizeString(fileName) + moduleName + 'Style',
}

export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  const { adapter, generateResetClassName, rootNode, extractCss } = config

  if (!adapter) {
    throw new Error(
      'An adapter needs to passed in order to generate code. See @elodin/generator-reason/lib/adapters for more information.'
    )
  }

  let cssReset = baseReset(generateResetClassName)
  if (rootNode) {
    cssReset += rootReset(rootNode)
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
    const relativeRootPath = '../'.repeat(path.split('/').length - 1)

    config.relativeRootPath = relativeRootPath || './'

    const css = extractCss ? generateCSSFiles(escapedAst, config, fileName) : {}
    const reason = generateReasonFile(escapedAst, config, fileName)

    return {
      [relativeRootPath + '_reset.elo.css']: cssReset,
      ...css,
      ...reason,
    }
  }

  generate.filePattern = [
    config.generateFileName('*', '') + '.re',
    config.generateFileName('*', '') + '.bs.js',
    '*.elo.css',
  ]

  generate.ignorePattern = ['node_modules']

  return generate
}

function generateReasonFile(ast, config, fileName) {
  const {
    adapter,
    devMode,
    generateFileName,
    relativeRootPath,
    dynamicImport,
    extractCss,
  } = config
  const moduleName = generateFileName(fileName, '')

  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  const imports = extractCss
    ? styles.reduce((imports, module) => {
        imports.push('require("./' + moduleName + module.name + '.elo.css")')
        return imports
      }, [])
    : []

  const modules = generateModules(ast, config, moduleName)

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
    [moduleName + '.re']: adapter.generateFile({
      relativeRootPath,
      cssImports: config.dynamicImport
        ? ''
        : imports
            .map(cssFile => '[%bs.raw {|\n  ' + cssFile + '\n|}];')
            .join('\n\n') + '\n\n',
      variables: allVariables,
      modules,
      variantTypes,
    }),
  }
}

function generateCSSFiles(ast, { devMode, generateFileName }, fileName) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')
  const generatedFileName = generateFileName(fileName, '')

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

    files[generatedFileName + module.name + '.elo.css'] = classes
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
  { devMode, generateResetClassName, dynamicImport, adapter, extractCss },
  moduleName
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
    const style = generateStyle(module.body, extractCss)
    const variables = getVariablesFromAST(module)
    const variantStyleMap = generateVariantStyleMap(
      module.body,
      variants,
      extractCss
    )
    const usedVariants = getVariantsFromAST(module)
    const variantNames = Object.keys(usedVariants).sort((x, y) =>
      variantOrder.indexOf(x) > variantOrder.indexOf(y) ? 1 : -1
    )

    const className =
      generateResetClassName(module.format) +
      (extractCss ? ' ' + getModuleName(module, devMode) : '')

    let dynamicStyle =
      !extractCss || variables.length > 0
        ? variantStyleMap
            .map(
              vari =>
                'let ' +
                uncapitalizeString(module.name) +
                'Style' +
                Object.keys(vari.variants)
                  .map(variant => vari.variants[variant])
                  .join('') +
                ' = ' +
                'style([' +
                vari.style.map(stringifyDeclaration).join(',\n      ') +
                ']);'
            )
            .join('\n    ')
        : undefined

    let variantSwitch = ''
    let variantStyleSwitch = ''

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

      if (variables.length > 0 && dynamicStyle) {
        variantStyleSwitch = `let get${
          module.name
        }StyleVariants = (${variables
          .map(variable => '~' + variable)
          .join(', ') +
          (variables.length > 0 && variants.length > 0 ? ', ' : '') +
          variantNames
            .map(name => '~' + name.toLowerCase())
            .join(', ')}, ()) => {
    ${dynamicStyle + '\n\n'}switch (${variantNames
          .map(v => v.toLowerCase())
          .join(', ')}) {
    ${combis
      // .filter(({ style }) => style.length > 0)
      .map(
        ({ combination, style }) =>
          '| (' +
          combination
            .map(comb => (comb === 'None' ? 'None' : 'Some(' + comb + ')'))
            .join(', ') +
          ') => ' +
          '[' +
          style
            .map(style => uncapitalizeString(module.name) + 'Style' + style)
            .join(',') +
          ']'
      )
      .join('\n    ')}
    }
  };`
      }

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

    rules.push(
      adapter.generateModule({
        styleName: module.name.charAt(0).toLowerCase() + module.name.substr(1),
        style,
        cssImport:
          dynamicImport && extractCss
            ? '[%bs.raw {| import("./' +
              moduleName +
              module.name +
              '.elo.css") |}];\n  '
            : '',
        variables,
        variantNames,
        variantStyleSwitch,
        variantSwitch: extractCss ? variantSwitch : '',
        className,
        module,
      })
    )

    return rules
  }, [])
}

function generateVariantStyleMap(
  nodes,
  variants,
  extractCss,
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
              extractCss,
              styles,
              generateStyle(nest.body, extractCss),
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

function generateStyle(nodes, extractCss) {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nestings = nodes.filter(node => node.type !== 'Declaration')

  const declarations = base
    .filter(decl => (extractCss ? decl.dynamic : true))
    .map(declaration => ({
      property: declaration.property,
      value: generateValue(
        declaration.value,
        declaration.property,
        declaration.dynamic
      ),
    }))

  const nests = nestings
    .map(nest => {
      if (nest.property.type === 'Variable' && nest.property.environment) {
        if (
          nest.boolean &&
          (isPseudoClass(nest.property.value) ||
            isPseudoElement(nest.property.value))
        ) {
          return {
            property: nest.property.value,
            value: generateStyle(nest.body, extractCss),
          }
        }

        if (isMediaQuery(nest.property.value)) {
          return {
            property: generateCSSMediaQueryFromNode(
              nest.boolean ? undefined : nest.value.value,
              nest.property.value,
              nest.operator
            ),
            value: generateStyle(nest.body, extractCss),
            media: true,
          }
        }
      }
    })
    .filter(nesting => nesting && nesting.value.length > 0)

  return [...declarations, ...nests]
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
