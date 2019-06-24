import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'
import color from 'color'

import hash from './hash'

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
  modulePrefix: 'Elodin',
}
export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  return function generate(ast, fileName) {
    const css = generateCSS(ast, config)
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
  const moduleName =
    config.modulePrefix +
    fileName
      .replace(/[.]elo/gi, '')
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))

  const styles = ast.body.filter(node => node.type === 'Style')

  const imports = styles.reduce((imports, module) => {
    imports.push('import("' + module.name + '.elo.css")')
    return imports
  }, [])

  return {
    [moduleName + '.re']:
      '[%bs.raw {|\n  ' +
      imports.join('\n  ') +
      '\n|}]' +
      '\n\n' +
      'module ' +
      moduleName +
      ' {\n' +
      '  open Css;' +
      '\n\n  ' +
      modules.join('\n\n  ') +
      '\n}',
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
      (unit ? 'px' : '')
    )
  }

  if (value.type === 'Identifier') {
    return hyphenateProperty(value.value)
  }

  return value.value
}

function generateCSS(ast, { devMode }) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  return styles.reduce((files, module) => {
    const classes = generateClasses(module.body, variants)

    files[module.name + '.elo.css'] = classes
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

function generateModules(ast, config) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')

  return styles.reduce((rules, module) => {
    const style = generateStyle(module.body)

    const className =
      '_elo_' + module.format + ' ' + getModuleName(module, config.devMode)
    rules.push(
      `let ` +
        module.name +
        ' = (' +
        // TODO: deduplicate
        // TODO: add typings
        style.map(({ value }) => '~' + value).join(', ') +
        ') => "' +
        className +
        '" + style([' +
        '\n    ' +
        style
          .map(
            ({ property, value }) => 'unsafe("' + property + '", ' + value + ')'
          )
          .join(',\n    ') +
        '\n  ' +
        '])'
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
