import adapters from './adapters'

export default function createGenerator({ adapterName = 'fela' }) {
  const adapter = adapters.find(adapter => adapter.name === adapterName)

  return function generate(ast, fileName) {
    const css = generateCSS(ast)
    const js = generateJS(ast, adapter)
    const root = generateRoot(ast)

    return { _root: root, ...css, ...js }
  }
}

function generateRoot(ast) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')

  const imports = styles
    .map(
      module =>
        'import { ' + module.name + " } from './" + module.name + ".elodin.js'"
    )
    .join('\n')

  return (
    imports +
    '\n\n' +
    'export {\n  ' +
    styles.map(module => module.name).join(',\n  ') +
    '\n}'
  )
}

function generateCSSValue(value, unit = true) {
  if (value.type === 'NumericLiteral') {
    return value.value + (unit ? 'px' : '')
  }

  if (value.type === 'FunctionExpression') {
    return (
      value.callee +
      '(' +
      value.params.map(param => generateCSSValue(param, false)).join(',') +
      ')'
    )
  }

  if (value.type === 'Float') {
    return value.integer + '.' + value.fractional + (unit ? 'px' : '')
  }

  return value.value
}

function generateCSS(ast) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')

  return styles.reduce((files, module) => {
    const classes = generateClasses(module.body)

    files[module.name + '.elodin.css'] = classes
      .filter(selector => selector.declarations.length > 0)
      .map(selector => {
        const css = stringifyCSS(
          selector.declarations,
          module.name + selector.pseudo
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

function generateClasses(nodes, classes = [], pseudo = '', media = '') {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nesting = nodes.filter(node => node.type !== 'Declaration')

  classes.push({
    media,
    pseudo,
    declarations: getStaticDeclarations(base),
  })

  nesting.forEach(nest => {
    if (nest.property.type === 'Variable' && nest.property.environment) {
      if (nest.boolean && nest.property.value === 'hover') {
        generateClasses(
          nest.body,
          classes,
          pseudo + ':' + nest.property.value,
          media
        )
      }

      if (nest.property.value === 'minWidth') {
        generateClasses(
          nest.body,
          classes,
          pseudo,
          '(min-width:' + nest.value.value + 'px)'
        )
      }
    }
  })

  return classes
}

function getStaticDeclarations(declarations) {
  return declarations
    .filter(decl => decl.value.type !== 'Variable')
    .map(declaration => ({
      property: declaration.property,
      value: generateCSSValue(declaration.value),
    }))
}

var uppercasePattern = /[A-Z]/g
var msPattern = /^ms-/
var cache = {}

function hyphenateProperty(string) {
  return string in cache
    ? cache[string]
    : (cache[string] = string
        .replace(uppercasePattern, '-$&')
        .toLowerCase()
        .replace(msPattern, '-ms-'))
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

function generateJS(ast, adapter) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')

  return styles.reduce((files, module) => {
    const style = generateStyle(module.body)

    files[module.name + '.elodin.js'] = adapter.stringify(style, module.name)
    return files
  }, {})
}

function generateStyle(nodes) {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nestings = nodes.filter(node => node.type !== 'Declaration')

  const declarations = base
    .filter(decl => decl.value.type === 'Variable')
    .map(declaration => ({
      property: declaration.property,
      value: declaration.value.value,
    }))

  const nests = nestings
    .map(nest => {
      if (nest.property.type === 'Variable' && nest.property.environment) {
        if (nest.boolean && nest.property.value === 'hover') {
          return {
            property: ':' + nest.property.value,
            value: generateStyle(nest.body),
          }
        }

        if (nest.property.value === 'minWidth') {
          return {
            property: '@media (min-width: ' + nest.value.value + 'px)',
            value: generateStyle(nest.body),
          }
        }
      }
    })
    .filter(nesting => nesting && nesting.value.length > 0)

  return [...declarations, ...nests]
}
