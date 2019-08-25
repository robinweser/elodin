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
  generateCSSMediaQueryFromNode,
  flattenVariables,
  generateCSSClasses,
} from '@elodin/utils'
import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'

const defaultConfig = {
  devMode: false,
  generateFileName: (fileName, moduleName) =>
    capitalizeString(fileName) + moduleName + 'Style',
}
export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  return function generate(ast, path = '') {
    const fileName = path
      .split('/')
      .pop()
      .replace(/[.]elo/gi, '')
      .split('.')
      .map(capitalizeString)
      .join('')

    const modules = generateModules(ast, config)
    const css = generateCSSFiles(ast, config, fileName)
    const reason = generateReasonFile(ast, config, modules, fileName)

    return { ...css, ...reason }
  }
}

function generateReasonFile(
  ast,
  { devMode, generateFileName },
  modules,
  fileName
) {
  const moduleName = generateFileName(fileName, '')

  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  const imports = styles.reduce((imports, module) => {
    imports.push('require("./' + moduleName + module.name + '.elo.css")')
    return imports
  }, [])

  const variantMap = variants.reduce((flatVariants, variant) => {
    flatVariants[variant.name] = variant.body.map(variation => variation.value)

    return flatVariants
  }, {})

  const variantTypes = Object.keys(variantMap)
    .map(
      variant =>
        '[@bs.deriving jsConverter]\n' +
        `type ` +
        variant.toLowerCase() +
        ` =\n  ` +
        variantMap[variant].map(val => '| ' + val).join('\n  ')
    )
    .join('\n\n')

  return {
    [moduleName + '.re']:
      imports
        .map(cssFile => '[%bs.raw {|\n  ' + cssFile + '\n|}];')
        .join('\n\n') +
      '\n\n' +
      'open Css;' +
      '\n\n' +
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
    const classes = generateCSSClasses(module.body, variants)

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

function generateModules(ast, { devMode }) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  const variantMap = variants.reduce((flatVariants, variant) => {
    flatVariants[variant.name] = variant.body.map(variation => variation.value)

    return flatVariants
  }, {})

  return styles.reduce((rules, module) => {
    const style = generateStyle(module.body)

    const className =
      '_elo_' + module.format + ' ' + getModuleName(module, devMode)

    const variantNames = Object.keys(variantMap)

    let variantSwitch = ''
    if (variantNames.length > 0) {
      const combinations = getArrayCombinations(
        ...variantNames.map(variant => [...variantMap[variant], 'None'])
      )

      variantSwitch = `let get${module.name}Variants = (${variantNames
        .map(variant => '~' + variant.toLowerCase())
        .join(', ')}, ()) => {
  switch (${Object.keys(variantMap)
    .map(v => v.toLowerCase())
    .join(', ')}) {
    ${combinations
      // .filter(combination => combination.find(comp => comp !== 'None'))
      .map(
        combination =>
          '| (' +
          combination
            .map(comb => (comb === 'None' ? 'None' : 'Some(' + comb + ')'))
            .join(', ') +
          ') => "' +
          getModuleName(module, devMode) +
          getValueCombinations(
            ...combination
              .map((comb, index) =>
                comb === 'None' ? '' : '__' + variantNames[index] + '-' + comb
              )
              .filter(val => val !== '')
          )
            .filter(set => set.length > 0)
            .map(set => set.join(''))
            .join(' ' + getModuleName(module, devMode)) +
          '"'
      )
      .join('\n    ')}}
}\n\n`
    }

    rules.push(
      variantSwitch +
        `let ` +
        module.name.charAt(0).toLowerCase() +
        module.name.substr(1) +
        ' = (' +
        // TODO: deduplicate
        // TODO: add typings
        flattenVariables(style)
          .map(variable => '~' + variable + ':string')
          .join(', ') +
        (flattenVariables(style).length > 0 && variants.length > 0
          ? ', '
          : '') +
        variants.map(({ name }) => '~' + name.toLowerCase() + '=?').join(', ') +
        (flattenVariables(style).length > 0 || variants.length > 0
          ? ', ()) => "'
          : ') => "') +
        className +
        (variants.length > 0
          ? '" ++ " " ++ get' +
            module.name +
            'Variants(' +
            variants.map(({ name }) => '~' + name.toLowerCase()).join(', ') +
            ', ())'
          : '"') +
        (style.length > 0
          ? ' ++ " " ++ style([' +
            '\n    ' +
            style.map(stringifyDeclaration).join(',\n    ') +
            '\n  ' +
            '])'
          : '')
    )

    return rules
  }, [])
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
