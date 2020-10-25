import { getVariablesFromAST, getVariantsFromAST } from '@elodin/utils-core'
import {
  isPseudoClass,
  isPseudoElement,
  isMediaQuery,
  stringifyRule,
  generateMediaQueryFromNode,
  generateClasses,
  generateClassName,
  generateClassNameMap,
} from '@elodin/utils-css'
import {
  escapeKeywords,
  generateValue,
  getArrayCombinations,
  getValueCombinations,
} from '@elodin/utils-reason'
import { hyphenateProperty } from 'css-in-js-utils'
import capitalizeString from 'capitalize'
import uncapitalizeString from 'uncapitalize'

import keywords from './keywords'

const defaultConfig = {
  devMode: false,
  dynamicImport: false,
  generateStyleName: (styleName) => styleName,
  generateCSSFileName: (moduleName, styleName) =>
    capitalizeString(moduleName) + styleName + '.elo',
  generateReasonFileName: (fileName) => capitalizeString(fileName) + 'Style',
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
    const css = generateCSSFiles(escapedAst, config, fileName)
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

  return generate
}

function generateReasonFile(ast, config, fileName) {
  const {
    devMode,
    generateReasonFileName,
    generateCSSFileName,
    dynamicImport,
  } = config
  const moduleName = generateReasonFileName(fileName)

  // TODO: include fragments
  const styles = ast.body.filter((node) => node.type === 'Style')
  const variants = ast.body.filter((node) => node.type === 'Variant')

  const imports = styles.reduce((imports, module) => {
    imports.push(
      'require("./' + generateCSSFileName(fileName, module.name) + '.css")'
    )
    return imports
  }, [])

  const modules = generateModules(ast, config, fileName)

  const variantMap = variants.reduce((flatVariants, variant) => {
    flatVariants[variant.name] = variant.body.map(
      (variation) => variation.value
    )

    return flatVariants
  }, {})

  const allVariables = getVariablesFromAST(ast)
  const variantTypes = Object.keys(variantMap)
    .map(
      (variant) =>
        '[@bs.deriving jsConverter]\n' +
        `type ` +
        variant.toLowerCase() +
        ` =\n  ` +
        variantMap[variant].map((val) => '| ' + val).join('\n  ') +
        ';'
    )
    .join('\n\n')

  return {
    [moduleName + '.re']:
      (!dynamicImport && imports.length > 0
        ? imports.map((file) => '[%bs.raw {| ' + file + ' |}];').join('\n') +
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
  const styles = ast.body.filter((node) => node.type === 'Style')
  const variants = ast.body.filter((node) => node.type === 'Variant')

  return styles.reduce((files, module) => {
    const usedVariants = getVariantsFromAST(module)
    const variantMap = variants.reduce((flatVariants, variant) => {
      if (usedVariants[variant.name]) {
        flatVariants[variant.name] = variant.body.map(
          (variation) => variation.value
        )
      }

      return flatVariants
    }, {})

    const classes = generateClasses(module.body, variantMap, devMode)

    files[generateCSSFileName(fileName, module.name) + '.css'] = classes
      .filter((selector) => selector.declarations.length > 0)
      .map((selector) => {
        const css = stringifyRule(
          selector.declarations,
          generateClassName(module, devMode) +
            selector.modifier +
            selector.pseudo,
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
    baseClassName,
    generateStyleName,
    generateCSSFileName,
  },
  fileName
) {
  // TODO: include fragments
  const styles = ast.body.filter((node) => node.type === 'Style')
  const variants = ast.body.filter((node) => node.type === 'Variant')

  const variantMap = variants.reduce((flatVariants, variant) => {
    flatVariants[variant.name] = variant.body.map(
      (variation) => variation.value
    )

    return flatVariants
  }, {})

  const variantOrder = Object.keys(variantMap)

  return styles.reduce((rules, module) => {
    const variables = getVariablesFromAST(module)
    const usedVariants = getVariantsFromAST(module)
    const variantNames = Object.keys(usedVariants).sort((x, y) =>
      variantOrder.indexOf(x) > variantOrder.indexOf(y) ? 1 : -1
    )

    const params = [...variables, ...variantNames]

    const className =
      (baseClassName ? baseClassName + ' ' : '') +
      generateClassName(module, devMode)

    let variantSwitch = ''

    if (variantNames.length > 0) {
      const combinations = getArrayCombinations(
        ...variantNames.map((variant) => [...variantMap[variant], 'None'])
      )

      variantSwitch = `let get${module.name}Variants = (${variantNames
        .map((variant) => '~' + variant.toLowerCase())
        .join(', ')}, ()) => {
  switch (${variantNames.map((v) => v.toLowerCase()).join(', ')}) {
    ${combinations
      // .filter(combination => combination.find(comp => comp !== 'None'))
      .map(
        (combination) =>
          '| (' +
          combination
            .map((comb) => (comb === 'None' ? 'None' : 'Some(' + comb + ')'))
            .join(', ') +
          ') => "' +
          (combination.find((val) => val !== 'None') &&
          combination.reduce(
            (hasCombination, value, index) =>
              value === 'None' ||
              usedVariants[variantNames[index]].indexOf(value) !== -1 ||
              hasCombination,
            false
          )
            ? ' ' +
              generateClassName(module, devMode) +
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
                  .filter((val) => val !== '')
              )
                .filter((set) => set.length > 0)
                .map((set) => set.join(''))
                .join(' ' + generateClassName(module, devMode))
            : '') +
          '"'
      )
      .join('\n    ')}\n  }
};\n\n`
    }

    const cls =
      (className ? wrapInString(className) : '') +
      (variantSwitch
        ? (className ? ' ++ " " ++ ' : '') +
          'get' +
          module.name +
          'Variants(' +
          variantNames.map((n) => '~' + uncapitalizeString(n)).join(', ') +
          ', ())'
        : '')

    const rule =
      'let ' +
      uncapitalizeString(generateStyleName(module.name)) +
      ' = (' +
      (params.length > 0
        ? params
            .map((name) => '~' + uncapitalizeString(name) + '=?')
            .join(', ') + ', ()'
        : '') +
      ') => {\n' +
      (dynamicImport
        ? '  [%bs.raw {| import("./' +
          generateCSSFileName(fileName, module.name) +
          '.css") |}];\n\n'
        : '') +
      '  ' +
      cls +
      '\n}'

    rules.push(variantSwitch + rule)
    return rules
  }, [])
}

function stringifyStyle(style, out = '', level = 2) {
  Object.keys(style).map((property) => {
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
              (extension) =>
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

function wrapInString(value) {
  return '"' + value + '"'
}

function wrapInParens(value) {
  return '(' + value + ')'
}
