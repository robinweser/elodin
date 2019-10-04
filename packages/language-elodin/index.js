var vscode = require('vscode')

var properties = [
  'alignContent',
  'alignItems',
  'alignSelf',
  'backgroundColor',
  'borderBottomColor',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomWidth',
  'borderColor',
  'borderLeftColor',
  'borderLeftWidth',
  'borderRadius',
  'borderRightColor',
  'borderRightWidth',
  'borderStyle',
  'borderTopColor',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopWidth',
  'borderWidth',
  'bottom',
  'color',
  'direction',
  'display',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'height',
  'justifyContent',
  'left',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'opacity',
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'position',
  'right',
  'textAlign',
  'textDecorationLine',
  'top',
  'width',
]

var valueMap = {
  direction: ['ltr', 'rtl'],
  position: ['relative', 'absolute'],
  flexBasis: ['auto'],
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
  textAlign: ['auto', 'justify', 'center', 'left', 'right'],
  textDecorationLine: ['none', 'underline', 'lineThrough'],
}

const values = [
  'absolute',
  'auto',
  'baseline',
  'center',
  'column',
  'columnReverse',
  'dashed',
  'dotted',
  'flexEnd',
  'flexStart',
  'hide',
  'italic',
  'justify',
  'left',
  'lineThrough',
  'ltr',
  'none',
  'normal',
  'nowrap',
  'relative',
  'right',
  'row',
  'rowReverse',
  'rtl',
  'show',
  'solid',
  'spaceAround',
  'spaceBetween',
  'spaceEvenly',
  'stretch',
  'underline',
  'wrap',
]
var functions = ['rgb', 'hsl', 'rgba', 'hsla', 'hex', 'percentage']
var keywords = ['view', 'text', 'variant', 'fragment']
var mediaQueries = ['viewportWidth', 'viewportHeight', 'landscape', 'portrait']
var pseudoClasses = [
  'active',
  'checked',
  'default',
  'disabled',
  'empty',
  'enabled',
  'first',
  'firstChild',
  'firstOfType',
  'focus',
  'focusWithin',
  'hover',
  'inRange',
  'intermediate',
  'invalid',
  'lastChild',
  'lastOfType',
  'left',
  'link',
  'onlyChild',
  'onlyOfType',
  'optional',
  'readOnly',
  'readWrite',
  'required',
  'right',
  'target',
  'valid',
  'visited',
]
var pseudoElements = [
  'after',
  'before',
  'firstLetter',
  'firstLine',
  'selection',
]

vscode.languages.registerCompletionItemProvider(
  { language: 'elodin' },
  {
    provideCompletionItems(document, position, token, context) {
      if (context.triggerCharacter !== ':') {
        return []
      }

      var textBefore = document
        .lineAt(position)
        .text.substr(0, position.character - 1)
      var splitted = textBefore.split(' ').pop()

      if (valueMap[splitted]) {
        return valueMap[splitted].map(function(p) {
          return new vscode.CompletionItem(p)
        })
      }
    },
  },
  ':'
)

vscode.languages.registerCompletionItemProvider(
  { language: 'elodin' },
  {
    provideCompletionItems(document, position, token, context) {
      if (context.triggerCharacter !== '@') {
        return []
      }
      return [...mediaQueries, ...pseudoClasses, ...pseudoElements].map(
        function(p) {
          return new vscode.CompletionItem(p)
        }
      )
    },
  },
  '@'
)

vscode.languages.registerCompletionItemProvider(
  { language: 'elodin' },
  {
    provideCompletionItems(document, position, token, context) {
      if (
        context.triggerCharacter === ':' ||
        context.triggerCharacter === '@'
      ) {
        return []
      }

      const textToChar = document
        .lineAt(position)
        .text.substr(0, position.character)
      var textBefore = textToChar.trim()

      if (textBefore.charAt(textBefore.length - 1) === ':') {
        var splitted = textBefore
          .substr(0, textBefore.length - 1)
          .split(' ')
          .pop()

        if (valueMap[splitted]) {
          return valueMap[splitted].map(function(p) {
            return new vscode.CompletionItem(p)
          })
        }
      }

      return [
        ...properties,
        ...keywords,
        ...values,
        ...mediaQueries,
        ...pseudoClasses,
        ...pseudoElements,
        ...functions,
      ].map(function(p) {
        return new vscode.CompletionItem(p)
      })
    },
  }
)
