var vscode = require('vscode')

var properties = [
  'backgroundColor',
  'direction',
  'position',
  'display',
  'opacity',
  'zIndex',
  'padding',
  'paddingBottom',
  'paddingTop',
  'paddingLeft',
  'paddingRight',
  'margin',
  'marginBottom',
  'marginTop',
  'marginLeft',
  'marginRight',
  'bottom',
  'top',
  'left',
  'right',
  'width',
  'height',
  'maxWidth',
  'maxHeight',
  'minWidth',
  'minHeight',
  'borderWidth',
  'borderBottomWidth',
  'borderTopWidth',
  'borderLeftWidth',
  'borderRightWidth',
  'borderColor',
  'borderBottomColor',
  'borderTopColor',
  'borderLeftColor',
  'borderRightColor',
  'borderStyle',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'flexWrap',
  'flexDirection',
  'justifyContent',
  'alignSelf',
  'alignItems',
  'alignContent',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'textAlign',
  'textDecorationLine',
  'fontFamily',
  'letterSpacing',
  'lineHeight',
  'color',
]

var values = {
  direction: ['ltr', 'rtl'],
  position: ['relative', 'absolute'],
  display: ['show', 'hide'],
  borderStyle: ['solid', 'dotted', 'dashed'],
  flexWrap: ['nowrap', 'wrap'],
  flexDirection: ['row', 'rowReverse', 'column', 'columnReverse'],
  justifyContent: [
    'flexStart',
    'flexEnd',
    'center',
    'spaceBetween',
    'spaceAround',
    'spaceEvenly',
  ],
  alignSelf: ['auto', 'flexStart', 'flexEnd', 'center', 'stretch', 'baseline'],
  alignItems: ['flexStart', 'flexEnd', 'center', 'stretch', 'baseline'],
  alignContent: [
    'flexStart',
    'flexEnd',
    'center',
    'stretch',
    'spaceBetween',
    'spaceAround',
  ],
  fontStyle: ['normal', 'italic'],
  textAlign: ['auto', 'justify,', 'center', 'left', 'right'],
  textDecorationLine: ['none', 'underline', 'lineThrough'],
}

var functions = ['rgb', 'hsl', 'rgba', 'hsla', 'hex', 'percentage']
var keywords = ['view', 'text', 'variant', 'fragment']
var mediaQueries = ['viewportWidth', 'viewportHeight']
var pseudoClasses = [
  'link',
  'hover',
  'focus',
  'active',
  'visited',
  'checked',
  'default',
  'empty',
  'enabled',
  'first',
  'disabled',
  'focusWithin',
  'firstChild',
  'lastChild',
  'firstOfType',
  'intermediate',
  'inRange',
  'invalid',
  'lastOfType',
  'left',
  'onlyChild',
  'onlyOfType',
  'optional',
  'readOnly',
  'readWrite',
  'required',
  'right',
  'target',
  'valid',
]
var pseudoElements = [
  'before',
  'after',
  'firstLine',
  'firstLetter',
  'selection',
]

vscode.languages.registerCompletionItemProvider(
  { language: 'elodin' },
  {
    provideCompletionItems(document, position, token, context) {
      return [
        ...properties,
        ...keywords,
        ...functions,
        ...mediaQueries,
        ...pseudoClasses,
        ...pseudoElements,
      ].map(function(p) {
        return new vscode.CompletionItem(p)
      })
    },
  }
)

vscode.languages.registerCompletionItemProvider(
  { language: 'elodin' },
  {
    provideCompletionItems(document, position, token, context) {
      var textBefore = document
        .lineAt(position)
        .text.substr(0, position.character - 1)
      var splitted = textBefore.split(' ').pop()

      if (values[splitted]) {
        return values[splitted].map(function(p) {
          return new vscode.CompletionItem(p)
        })
      }
    },
  },
  ':'
)
