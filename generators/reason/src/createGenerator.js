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
} from '@elodin/utils'
import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'

import keywords from './keywords'
import { baseReset, rootReset } from './getReset'

const defaultConfig = {
  devMode: false,
  generateResetClassName: type => '_elo_' + type,
  generateFileName: (fileName, moduleName) =>
    capitalizeString(fileName) + moduleName + 'Style',
}

export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  let cssReset = baseReset(config.generateResetClassName)
  if (config.rootNode) {
    cssReset += rootReset(config.rootNode)
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

    const modules = generateModules(escapedAst, config)
    const css = generateCSSFiles(escapedAst, config, fileName)
    const reason = generateReasonFile(escapedAst, config, modules, fileName)

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

function generateReasonFile(
  ast,
  { devMode, generateFileName, relativeRootPath },
  modules,
  fileName
) {
  const moduleName = generateFileName(fileName, '')

  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  const imports = styles.reduce(
    (imports, module) => {
      imports.push('require("./' + moduleName + module.name + '.elo.css")')
      return imports
    },
    ['require("' + relativeRootPath + '_reset.elo.css")']
  )

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
      imports
        .map(cssFile => '[%bs.raw {|\n  ' + cssFile + '\n|}];')
        .join('\n\n') +
      '\n\n' +
      (allVariables.length > 0 ? 'open Css;' + '\n\n' : '') +
      variantTypes +
      '\n\n' +
      modules.join('\n\n') +
      '\n',
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

function generateModules(ast, { devMode, generateResetClassName }) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  const variantMap = variants.reduce((flatVariants, variant) => {
    flatVariants[variant.name] = variant.body.map(variation => variation.value)

    return flatVariants
  }, {})
  const variantOrder = Object.keys(variantMap)

  return styles.reduce((rules, module) => {
    const style = generateStyle(module.body)
    const variables = getVariablesFromAST(module)
    const variantStyleMap = generateVariantStyleMap(module.body, variants)
    const usedVariants = getVariantsFromAST(module)
    const variantNames = Object.keys(usedVariants).sort((x, y) =>
      variantOrder.indexOf(x) > variantOrder.indexOf(y) ? 1 : -1
    )

    const className =
      generateResetClassName(module.format) +
      ' ' +
      getModuleName(module, devMode)

    let dynamicStyle =
      variables.length > 0
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
        ...Object.keys(usedVariants).map(variant => [
          ...variantMap[variant],
          'None',
        ])
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
          .map(variable => '~' + variable + ':string')
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

    const baseStyle =
      style.length > 0
        ? 'let ' +
          uncapitalizeString(module.name) +
          'Style = (' +
          variables.map(variable => '~' + variable + ':string').join(', ') +
          ') => style([' +
          style.map(stringifyDeclaration).join(',\n    ') +
          ']);'
        : ''

    rules.push(
      (baseStyle ? baseStyle + '\n' : '') +
        (variantStyleSwitch ? variantStyleSwitch + '\n\n' : '') +
        (variantSwitch ? variantSwitch + '\n\n' : '') +
        `let ` +
        module.name.charAt(0).toLowerCase() +
        module.name.substr(1) +
        ' = (' +
        // TODO: deduplicate
        // TODO: add typings
        variables.map(variable => '~' + variable + ':string').join(', ') +
        (variables.length > 0 && variantNames.length > 0 ? ', ' : '') +
        variantNames.map(name => '~' + name.toLowerCase() + '=?').join(', ') +
        (variables.length > 0 || variantNames.length > 0
          ? ', ()) => "'
          : ') => "') +
        className +
        (variantNames.length > 0
          ? '" ++ get' +
            module.name +
            'Variants(' +
            variantNames.map(name => '~' + name.toLowerCase()).join(', ') +
            ', ())'
          : '"') +
        (style.length > 0 || variantStyleSwitch
          ? ' ++ " " ++ merge([' +
            (style.length > 0
              ? uncapitalizeString(module.name) +
                'Style(' +
                variables.map(variable => '~' + variable).join(', ') +
                ')'
              : '') +
            (variantStyleSwitch
              ? (style.length > 0 ? ', ' : '') +
                '...get' +
                module.name +
                'StyleVariants(' +
                variables.map(variable => '~' + variable).join(', ') +
                (variables.length > 0 && variantNames.length > 0 ? ', ' : '') +
                variantNames.map(name => '~' + name.toLowerCase()).join(', ') +
                ', ())'
              : '') +
            ']);'
          : ';')
    )

    return rules
  }, [])
}

function generateVariantStyleMap(
  nodes,
  variants,
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
              styles,
              generateStyle(nest.body),
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

function generateStyle(nodes) {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nestings = nodes.filter(node => node.type !== 'Declaration')

  const declarations = base
    .filter(decl => decl.dynamic)
    .map(declaration => ({
      property: declaration.property,
      value: declaration.value.value,
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
            value: generateStyle(nest.body),
          }
        }

        if (isMediaQuery(nest.property.value)) {
          return {
            property: generateCSSMediaQueryFromNode(
              nest.value.value,
              nest.property.value,
              nest.operator
            ),
            value: generateStyle(nest.body),
            media: true,
          }
        }
      }
    })
    .filter(nesting => nesting && nesting.value.length > 0)

  return [...declarations, ...nests]
}

function stringifyDeclaration({ property, value, media }) {
  if (media && typeof value === 'object') {
    return (
      'media("' +
      property +
      '", [' +
      value.map(stringifyDeclaration).join(',\n') +
      '])'
    )
  }

  if (typeof value === 'object') {
    return property + '([' + value.map(stringifyDeclaration).join(',\n') + '])'
  }

  return 'unsafe("' + hyphenateProperty(property) + '", ' + value + ')'
}
