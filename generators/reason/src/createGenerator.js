import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'
import color from 'color'

import hash from './hash'

function capitalizeString(str) {
  return str.charAt(0).toUpperCase() + str.substr(1)
}

function uncapitalizeString(str) {
  return str.charAt(0).toLowerCase() + str.substr(1)
}

const validPseudoClasses = [
  'link',
  'hover',
  'focus',
  'active',
  'visited',
  'disabled',
  'focusWithin',
  'firstChild',
  'lastChild',
]

const validMediaQueries = ['viewportWidth', 'viewportHeight']

function stringifyDeclaration(declaration) {
  const prop = '"' + declaration.property + '":'

  if (typeof declaration.value === 'object') {
    return (
      prop + '{' + declaration.value.map(stringifyDeclaration).join(',\n') + '}'
    )
  }

  return prop + 'props.' + declaration.value
}

const defaultConfig = {
  devMode: false,
  dynamicImport: false,
  generateFileName: (fileName, moduleName) =>
    capitalizeString(fileName) + moduleName + 'Style',
}
export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  return function generate(ast, path) {
    const fileName = path
      .split('/')
      .pop()
      .replace(/[.]elo/gi, '')
      .split('.')
      .map(capitalizeString)
      .join('')

    const css = generateCSS(ast, config, fileName)
    const modules = generateModules(ast, config)
    const reason = generateReason(ast, config, modules, fileName)

    return { ...css, ...reason }
  }
}

function getModuleName(module, devMode) {
  const hashedBody = '_' + hash(JSON.stringify(module.body))

  if (devMode) {
    return module.name + hashedBody
  }
  return hashedBody
}

function generateReason(ast, config, modules, fileName) {
  // TODO: include fragments
  const moduleName = config.generateFileName(fileName, '')

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

function generateCSSValue(value, property, unit = true) {
  if (value.type === 'Integer') {
    return (
      (value.negative ? '-' : '') +
      value.value +
      (unit && !isUnitlessProperty(property) ? 'px' : '')
    )
  }

  if (value.type === 'RawValue' || value.type === 'String') {
    return value.value
  }

  if (value.type === 'Percentage') {
    if (property === 'opacity') {
      return value.value / 100
    } else {
      return value.value + '%'
    }
  }

  if (value.type === 'Color') {
    const { format, red, blue, green, alpha } = value

    const colorValue = color.rgb(red, green, blue, alpha)
    if (format === 'hex') {
      return colorValue.hex()
    }

    if (format === 'keyword') {
      // TODO: check APIs
      return colorValue.keyword()
    }

    return colorValue[format]().string()
  }

  if (value.type === 'Float') {
    return (
      (value.negative ? '-' : '') +
      value.integer +
      '.' +
      value.fractional +
      (unit && !isUnitlessProperty(property) ? 'px' : '')
    )
  }

  if (value.type === 'Identifier') {
    return hyphenateProperty(value.value)
  }

  return value.value
}

function generateCSS(ast, { devMode, generateFileName }, fileName) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')
  const generatedFileName = generateFileName(fileName, '')

  return styles.reduce((files, module) => {
    const classes = generateClasses(module.body, variants)

    files[generatedFileName + module.name + '.elo.css'] = classes
      .filter(selector => selector.declarations.length > 0)
      .map(selector => {
        const css = stringifyCSS(
          selector.declarations,
          getModuleName(module, devMode) + selector.modifier + selector.pseudo
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

function generateClasses(
  nodes,
  variants,
  classes = [],
  modifier = '',
  pseudo = '',
  media = ''
) {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nesting = nodes.filter(node => node.type !== 'Declaration')

  classes.push({
    media,
    pseudo,
    modifier,
    declarations: getStaticDeclarations(base),
  })

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
            generateClasses(
              nest.body,
              variants,
              classes,
              // TODO: variants in deterministic order
              modifier + '__' + variant.name + '-' + variation.value,
              pseudo,
              media
            )
          }
        }
      } else {
        // TODO: throw
      }
    }

    if (nest.property.type === 'Variable' && nest.property.environment) {
      if (
        nest.boolean &&
        validPseudoClasses.indexOf(nest.property.value) !== -1
      ) {
        generateClasses(
          nest.body,
          variants,
          classes,
          modifier,
          pseudo + ':' + hyphenateProperty(nest.property.value),
          media
        )
      }

      if (validMediaQueries.indexOf(nest.property.value) !== -1) {
        generateClasses(
          nest.body,
          variants,
          classes,
          modifier,
          pseudo,
          getMediaQuery(nest.value.value, nest.property.value, nest.operator)
        )
      }
    }
  })

  return classes
}

function getStaticDeclarations(declarations) {
  return declarations
    .filter(decl => !decl.dynamic)
    .map(declaration => ({
      property: declaration.property,
      value: generateCSSValue(declaration.value, declaration.property),
    }))
}

function stringifyCSS(declarations, name) {
  return (
    '.' +
    name +
    ' {\n  ' +
    declarations
      .map(decl => hyphenateProperty(decl.property) + ': ' + decl.value)
      .join(';\n  ') +
    '\n' +
    '}'
  )
}

function cartesian() {
  var r = [],
    arg = arguments,
    max = arg.length - 1
  function helper(arr, i) {
    for (var j = 0, l = arg[i].length; j < l; j++) {
      var a = arr.slice(0) // clone arr
      a.push(arg[i][j])
      if (i == max) r.push(a)
      else helper(a, i + 1)
    }
  }
  helper([], 0)
  return r
}

function generateModules(ast, config) {
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
      '_elo_' + module.format + ' ' + getModuleName(module, config.devMode)

    const variantNames = Object.keys(variantMap)

    let variantSwitch = ''
    if (variantNames.length > 0) {
      const combinations = cartesian(
        ...variantNames.map(variant => [...variantMap[variant], 'None'])
      )

      const powerset = array => {
        // O(2^n)
        const results = [[]]
        for (const value of array) {
          const copy = [...results] // See note below.
          for (const prefix of copy) {
            results.push(prefix.concat(value))
          }
        }
        return results
      }

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
                  .map(comb =>
                    comb === 'None' ? 'None' : 'Some(' + comb + ')'
                  )
                  .join(', ') +
                ') => "' +
                getModuleName(module, config.devMode) +
                powerset(
                  combination
                    .map((comb, index) =>
                      comb === 'None'
                        ? ''
                        : '__' + variantNames[index] + '-' + comb
                    )
                    .filter(val => val !== '')
                )
                  .filter(set => set.length > 0)
                  .map(set => set.join(''))
                  .join(' ' + getModuleName(module, config.devMode)) +
                '"'
            )
            .join('\n')}}
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
        style.map(({ value }) => '~' + value + ':string').join(', ') +
        (style.length > 0 && variants.length > 0 ? ', ' : '') +
        variants.map(({ name }) => '~' + name.toLowerCase() + '=?').join(', ') +
        (style.length > 0 || variants.length > 0 ? ', ()) => "' : ') => "') +
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
            style
              .map(
                ({ property, value }) =>
                  'unsafe("' + hyphenateProperty(property) + '", ' + value + ')'
              )
              .join(',\n    ') +
            '\n  ' +
            '])'
          : '')
    )

    return rules
  }, [])
}

function generateClassNameMap(
  nodes,
  variants,
  classes = {},
  variations = {},
  modifier = ''
) {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nesting = nodes.filter(node => node.type !== 'Declaration')

  classes[modifier] = variations

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
            generateClassNameMap(
              nest.body,
              variants,
              classes,
              {
                ...variations,
                [variant.name]: variation.value,
              },
              modifier + '__' + variant.name + '-' + variation.value
            )
          }
        }
      } else {
        // TODO: throw
      }
    }
  })

  return classes
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
          validPseudoClasses.indexOf(nest.property.value) !== -1
        ) {
          return {
            property: ':' + nest.property.value,
            value: generateStyle(nest.body),
          }
        }

        if (validMediaQueries.indexOf(nest.property.value) !== -1) {
          return {
            property: getMediaQuery(
              nest.value.value,
              nest.property.value,
              nest.operator
            ),
            value: generateStyle(nest.body),
          }
        }
      }
    })
    .filter(nesting => nesting && nesting.value.length > 0)

  return [...declarations, ...nests]
}

function getMediaQuery(value, property, operator) {
  const dimension = property.indexOf('Height') !== -1 ? 'height' : 'width'

  if (operator === '=') {
    return (
      '(min-' +
      dimension +
      ': ' +
      value +
      'px) and (max-' +
      dimension +
      ': ' +
      value +
      'px)'
    )
  }

  if (operator === '>') {
    return '(min-' + dimension + ': ' + (value + 1) + 'px)'
  }

  if (operator === '>=') {
    return '(min-' + dimension + ': ' + value + 'px)'
  }

  if (operator === '<=') {
    return '(max-' + dimension + ': ' + value + 'px)'
  }

  if (operator === '<') {
    return '(max-' + dimension + ': ' + (value - 1) + 'px)'
  }
}
