import tokenize from 'tokenize-sync'
import color from 'color'

import validateDeclaration from './validateDeclaration'
import errorTypes from './errorTypes'
import colorNames from './colorNames'

const ruleMap = {
  minus: /^[-]$/,
  comparison: /^[><=]+$/i,
  quote: /^("|\\")$/,
  identifier: /^[_a-z]+$/i,
  number: /^\d+$/,
  floating_point: /^[.]+$/,
  colon: /^:$/,
  whitespace: /^\s+$/,
  round_bracket: /^[()]$/,
  curly_bracket: /^[{}]$/,
  square_bracket: /^[\[\]]$/,
  variable: /^[$@]$/,
}

const OPERATOR_REGEX = /^(>|<|>=|<=|=)$/

export default class Parser {
  constructor(config = {}) {
    this.config = config
    this.context = config.context || {}
  }

  getNextToken(position) {
    const nextPosition = this.currentPosition + position

    if (nextPosition < this.tokens.length) {
      return this.tokens[nextPosition]
    }
  }

  updateCurrentToken(increment = 0) {
    this.currentPosition += increment
    this.currentToken = this.tokens[this.currentPosition]
  }

  isRunning() {
    return this.currentPosition < this.tokens.length - 1
  }

  addError(error, exit) {
    if (!this.exit) {
      const meta = {
        ...(this.parent || {}),
        path: this.context.path,
        source: this.context.source,
        line: this.context.source
          ? this.context.source.substr(0, this.currentToken.start).split('\n')
              .length
          : undefined,
        token: this.currentToken,
      }

      this.errors.push({ ...meta, ...error })
    }

    if (exit) {
      this.currentPosition = this.tokens.length - 1
      this.updateCurrentToken()
      this.exit = true
    }
  }

  parse(input) {
    this.tokens = tokenize(input.trim(), ruleMap, 'unknown').filter(
      token => token.type !== 'whitespace'
    )

    this.tokens.push({
      type: 'end_token',
    })

    // initialize/reset indices
    this.input = input
    this.currentPosition = 0
    this.errors = []
    this.variantConditionals = []
    this.updateCurrentToken()

    const file = {
      type: 'File',
      body: [],
    }

    while (this.isRunning()) {
      this.parent = undefined

      const node =
        this.parseStyle() || this.parseFragment() || this.parseVariant()

      if (node) {
        const duplicate = file.body.find(n => n.name === node.name)

        if (duplicate) {
          this.updateCurrentToken(1)

          this.addError(
            {
              type: errorTypes.DUPLICATE_MODULE,
              message: `The ${node.type.toLowerCase()} '${
                node.name
              }' has already been defined as a ${
                duplicate.type
              } in the same file.`,
              node,
              duplicate,
            },
            true
          )
        }
      }

      if (!node) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message:
              'Invalid Syntax. Top-level constructs can only be view, text, fragment or variant.',
          },
          true
        )
      }

      file.body.push(node)
    }

    const variants = file.body.filter(node => node.type === 'Variant')
    this.variantConditionals.forEach(({ property, value }) => {
      const matchingVariant = variants.find(v => v.name === property.value)

      if (!matchingVariant) {
        this.addError({
          type: errorTypes.INVALID_VARIANT,
          message: `The variant '${property.value}' is not defined.`,
        })
      } else {
        const matchingValue = matchingVariant.body.find(
          v => v.value === value.value
        )

        if (!matchingValue) {
          this.addError({
            type: errorTypes.INVALID_VARIANT,
            message: `The variant '${property.value}' does not define a '${value.value}' variation.`,
          })
        }
      }
    })

    return {
      errors: this.errors,
      tokens: this.tokens,
      ast: file,
    }
  }

  parseStyle() {
    if (
      this.currentToken.type === 'identifier' &&
      (this.currentToken.value === 'view' || this.currentToken.value === 'text')
    ) {
      const format = this.currentToken.value

      this.updateCurrentToken(1)

      const name = this.parseStyleName()

      if (!name) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message: 'A ' + format + ' must have a valid name.',
          },
          true
        )
      }

      if (name && name.charAt(0).toUpperCase() !== name.charAt(0)) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message:
              'A ' + format + ' name must begin with an uppercase letter.',
            name,
          },
          true
        )
      }

      this.parent = {
        type: 'Style',
        format,
        name,
      }

      const body = this.parseStyleBody()

      if (!body) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message: 'A ' + format + ' must at least contain 1 declaration.',
          },
          true
        )
      }

      return {
        ...this.parent,
        body,
      }
    }
  }

  parseStyleName() {
    if (this.currentToken.type === 'identifier') {
      const name = this.currentToken.value
      this.updateCurrentToken(1)
      return name
    }
  }

  parseStyleBody() {
    const body = []

    if (
      this.currentToken.type === 'curly_bracket' &&
      this.currentToken.value === '{'
    ) {
      this.updateCurrentToken(1)

      while (this.isRunning() && this.currentToken.type !== 'curly_bracket') {
        const node = this.parseDeclaration() || this.parseConditional()

        if (!node) {
          this.addError(
            {
              token: this.getNextToken(-1),
              type: errorTypes.SYNTAX_ERROR,
              message:
                'A ' +
                this.parent.format +
                ' must only contain declarations and conditional declarations.',
            },
            true
          )
        }

        const duplicate = body.find(n => n.property === node.property)

        if (duplicate) {
          this.addError(
            {
              type: errorTypes.DUPLICATE_PROPERTY,
              message: `The property ${duplicate.property} has already been declared before.`,
              duplicate,
            },
            true
          )
        }

        body.push(node)
        this.updateCurrentToken(1)
      }

      this.updateCurrentToken(1)
      return body
    }
  }

  parseFragment() {
    if (
      this.currentToken.type === 'identifier' &&
      this.currentToken.value === 'fragment'
    ) {
      this.updateCurrentToken(1)

      const name = this.parseStyleName()

      if (!name) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message: 'A fragment must have a valid name.',
          },
          true
        )
      }

      if (name && name.charAt(0).toUpperCase() !== name.charAt(0)) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message: 'Fragment names must begin with an uppercase letter.',
            name,
          },
          true
        )
      }

      this.parent = {
        type: 'fragment',
        name,
      }

      const body = this.parseFragmentBody()

      if (!body) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
          },
          true
        )
      }
      return {
        type: 'Fragment',
        name,
        body,
      }
    }
  }

  parseFragmentBody() {
    const body = []

    if (
      this.currentToken.type === 'curly_bracket' &&
      this.currentToken.value === '{'
    ) {
      this.updateCurrentToken(1)

      while (this.isRunning() && this.currentToken.type !== 'curly_bracket') {
        const declaration = this.parseDeclaration()

        if (!declaration) {
          this.addError(
            {
              type: errorTypes.SYNTAX_ERROR,
              messages: 'Fragments must only contain declarations.',
            },
            true
          )
        }
        body.push(declaration)
        this.updateCurrentToken(1)
      }

      this.updateCurrentToken(1)
      return body
    }
  }

  parseVariant() {
    if (
      this.currentToken.type === 'identifier' &&
      this.currentToken.value === 'variant'
    ) {
      this.updateCurrentToken(1)

      const name = this.parseStyleName()

      if (!name) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message: 'A variant must have a valid name.',
          },
          true
        )
      }

      if (name && name.charAt(0).toUpperCase() !== name.charAt(0)) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message: 'Variant names must begin with an uppercase letter.',
            name,
          },
          true
        )
      }

      this.parent = {
        type: 'variant',
        name,
      }

      const body = this.parseVariantBody()

      if (!body) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message: 'A variant must at least have 1 variation.',
          },
          true
        )
      }

      return {
        type: 'Variant',
        name,
        body,
      }
    }
  }

  parseVariantBody() {
    const body = []

    if (
      this.currentToken.type === 'curly_bracket' &&
      this.currentToken.value === '{'
    ) {
      this.updateCurrentToken(1)

      while (this.isRunning() && this.currentToken.type !== 'curly_bracket') {
        const variant = this.parseIdentifier()

        if (!variant) {
          this.addError(
            {
              type: errorTypes.SYNTAX_ERROR,
              message: 'Variants must only contain identifier variations.',
            },
            true
          )
        }

        if (
          variant &&
          variant.value.charAt(0).toUpperCase() !== variant.value.charAt(0)
        ) {
          this.addError(
            {
              type: errorTypes.SYNTAX_ERROR,
              message: 'Variations must begin with an uppercase letter.',
              variation: variant.value,
            },
            true
          )
        }

        const duplicate = body.find(v => v.value === variant.value)
        if (duplicate) {
          this.addError(
            {
              type: errorTypes.DUPLICATE_VARIANT,
              message: `The variation value ${duplicate.value} has already been declared before.`,
              variation: variant.value,
              duplicate,
            },
            true
          )
        }

        body.push(variant)
        this.updateCurrentToken(1)
      }

      this.updateCurrentToken(1)
      return body
    }
  }

  parseDeclaration() {
    if (this.currentToken.type === 'identifier') {
      const propertyToken = this.currentToken
      const property = propertyToken.value
      const isRawDeclaration = property.substr(0, 2) === '__'

      this.updateCurrentToken(1)

      if (this.currentToken.type === 'colon') {
        this.updateCurrentToken(1)
        this.isDynamic = false

        const valueToken = this.currentToken
        const value = this.parseValue()

        if (!value) {
          return this.addError(
            {
              type: errorTypes.SYNTAX_ERROR,
              message: 'A declaration must always have a valid value.',
            },
            true
          )
        }

        if (!isRawDeclaration) {
          const validation = validateDeclaration(
            property,
            value,
            value.value,
            this.parent.format
          )

          if (typeof validation === 'object') {
            if (validation.type === 'property') {
              this.addError(
                {
                  type: errorTypes.INVALID_PROPERTY,
                  property: property,
                  value: value,

                  message:
                    property +
                    ': ' +
                    value.value +
                    '\n^-------\n' +
                    'The property ' +
                    property +
                    ' is an invalid ' +
                    this.parent.format +
                    ' property.' +
                    '\n' +
                    'In ' +
                    this.parent.name +
                    (this.context.path
                      ? ' (' +
                        this.context.path +
                        ':' +
                        this.context.source
                          .substr(0, this.currentToken.start)
                          .split('\n').length +
                        ')'
                      : '') +
                    '\n',
                },
                false
              )
            }

            if (
              validation.type === 'value' &&
              value.type !== 'Variable' &&
              value.type !== 'RawValue'
            ) {
              this.addError(
                {
                  type: errorTypes.INVALID_VALUE,
                  value: value,
                  property: property,
                  message:
                    property +
                    ': ' +
                    value.value +
                    '\n' +
                    ' '.repeat(property.length + 2) +
                    '^-------\n' +
                    'The value ' +
                    value.value +
                    ' is an invalid value for the property ' +
                    property +
                    '.\n' +
                    'In ' +
                    this.parent.name +
                    (this.context.path
                      ? ' (' +
                        this.context.path +
                        ':' +
                        this.context.source
                          .substr(0, this.currentToken.start)
                          .split('\n').length +
                        ')'
                      : '') +
                    '\n',
                },
                false
              )
            }
          }
        }

        return {
          type: 'Declaration',
          raw: isRawDeclaration,
          dynamic: this.isDynamic,
          property: isRawDeclaration ? property.slice(2) : property,
          value,
        }
      }
    }
  }

  parseConditional() {
    if (
      this.currentToken.type === 'square_bracket' &&
      this.currentToken.value === '['
    ) {
      this.updateCurrentToken(1)

      const condition = this.parseCondition()

      if (!condition) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message: 'Conditional delcarations must have a valid condition.',
          },
          true
        )
      }

      const body = this.parseStyleBody()

      if (!body) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message:
              'Conditional declarations must at least contain 1 declaration.',
          },
          true
        )
      }

      this.updateCurrentToken(-1)

      if (!condition.boolean && condition.property.type === 'Identifier') {
        this.variantConditionals.push(condition)
      }

      return {
        ...condition,
        type: 'Conditional',
        body,
      }
    }
  }

  parseCondition() {
    const property = this.parseIdentifier() || this.parseVariable()

    if (property) {
      this.updateCurrentToken(1)

      if (this.currentToken.type === 'comparison') {
        const operator = this.currentToken.value

        if (operator.match(OPERATOR_REGEX) === null) {
          this.addError(
            {
              type: errorTypes.SYNTAX_ERROR,
              message: 'A condition must have a valid comparison operator.',
              operator,
            },
            true
          )

          return
        }

        if (property.type === 'Identifier' && operator !== '=') {
          this.addError(
            {
              type: errorTypes.SYNTAX_ERROR,
              message: 'Variant conditionals can only use equal comparison.',
              property,
              operator,
            },
            true
          )

          return
        }

        this.updateCurrentToken(1)
        const value = this.parseValue()
        this.updateCurrentToken(1)

        if (
          this.currentToken.type === 'square_bracket' &&
          this.currentToken.value === ']'
        ) {
          this.updateCurrentToken(1)

          return {
            property,
            operator,
            value,
          }
        }
      }

      // boolean conditions
      if (
        this.currentToken.type === 'square_bracket' &&
        this.currentToken.value === ']'
      ) {
        this.updateCurrentToken(1)

        return {
          property,
          boolean: true,
        }
      }
    }
  }

  parseValue() {
    if (this.currentToken.type === 'minus') {
      this.updateCurrentToken(1)
      return this.parseNumber(true)
    }

    return (
      this.parseNumber() ||
      this.parseIdentifier() ||
      this.parseVariable() ||
      this.parseString()
    )
  }

  parseString() {
    if (this.currentToken.type === 'quote') {
      let value = ''
      this.updateCurrentToken(1)

      while (this.isRunning() && this.currentToken.type !== 'quote') {
        // parse whitespace sensitive
        value +=
          ' '.repeat(this.currentToken.start - this.getNextToken(-1).end) +
          this.currentToken.value
        this.updateCurrentToken(1)
      }

      return {
        type: 'String',
        value,
      }
    }
  }

  parseNumber(isNegative = false) {
    if (this.currentToken.type === 'number') {
      const integer = this.currentToken.value

      const nextToken = this.getNextToken(1)
      const nextNextToken = this.getNextToken(2)

      if (
        nextToken.type === 'floating_point' &&
        nextNextToken.type === 'number'
      ) {
        this.updateCurrentToken(2)

        return {
          type: 'Float',
          integer: parseInt(integer),
          fractional: parseInt(nextNextToken.value),
          negative: isNegative,
        }
      }

      return {
        type: 'Integer',
        value: parseInt(integer),
        negative: isNegative,
      }
    }

    if (this.currentToken.type === 'floating_point') {
      this.updateCurrentToken(1)

      if (this.currentToken.type === 'number') {
        return {
          type: 'Float',
          integer: 0,
          fractional: parseInt(this.currentToken.value),
          negative: isNegative,
        }
      }
    }
  }

  parseUntil(until, cummulate = false) {
    const values = []

    while (this.isRunning() && !until(this.currentToken)) {
      const value = this.parseValue()

      if (!value) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            message:
              "The value couldn't be parsed. Maybe you're missing closing parenthesis.",
          },
          true
        )
      }

      values.push(value)
      this.updateCurrentToken(1)
    }

    return values
  }

  parseIdentifier() {
    if (this.currentToken.type === 'identifier') {
      const ident = this.currentToken.value
      const nextToken = this.getNextToken(1)
      if (nextToken.type === 'round_bracket' && nextToken.value === '(') {
        this.updateCurrentToken(2)

        const params = this.parseUntil(token => token.type === 'round_bracket')

        if (ident === 'percentage') {
          if (params.length === 1 && params[0]) {
            if (
              // parse float
              params[0].type === 'Integer' &&
              params[0].value >= 0 &&
              params[0].value <= 100
            ) {
              return {
                type: 'Percentage',
                value: params[0].value,
              }
            } else {
              this.addError(
                {
                  type: 'SYNTAX_ERROR',
                  message:
                    'Percentage values must contain an Integer between 0 and 100.',
                },
                true
              )
            }
          } else {
            this.addError(
              {
                type: 'SYNTAX_ERROR',
                message:
                  'The `percentage` function requires exactly 1 parameter of type Integer.',
              },
              true
            )
          }
        }

        if (ident === 'hex') {
          let normalizedValue
          try {
            normalizedValue = color(
              '#' + params.map(param => param && param.value).join('')
            )
          } catch (e) {
            this.addError(
              {
                type: 'SYNTAX_ERROR',
                message:
                  'A valid hexadecimal string of length 3, 6 or 8 must be passed to the `hex` function.',
              },
              true
            )
          }

          if (normalizedValue) {
            return {
              type: 'Color',
              red: normalizedValue.red(),
              green: normalizedValue.green(),
              blue: normalizedValue.blue(),
              alpha: normalizedValue.alpha(),
              format: 'hex',
            }
          }
        }

        if (ident === 'rgb' || ident === 'rgba') {
          const [
            red,
            green,
            blue,
            alpha = { type: 'Percentage', value: 100 },
          ] = params

          // TODO: validate value
          if (
            !red ||
            !green ||
            !blue ||
            red.type !== 'Integer' ||
            green.type !== 'Integer' ||
            blue.type !== 'Integer' ||
            alpha.type !== 'Percentage'
          ) {
            this.addError(
              {
                type: 'SYNTAX_ERROR',
                message: 'WRONG RGB',
              },
              true
            )
          } else {
            return {
              type: 'Color',
              red: red.value,
              green: green.value,
              blue: blue.value,
              alpha: alpha.value / 100,
              format: 'rgb',
            }
          }
        }

        if (ident === 'raw') {
          if (params.length === 1 && params[0] && params[0].type === 'String') {
            return {
              type: 'RawValue',
              value: params[0].value,
            }
          } else {
            this.addError(
              {
                type: errorTypes.SYNTAX_ERROR,
                message:
                  'The `raw` function only accepts a single String value.',
              },
              true
            )
          }
        }

        return {
          type: 'FunctionExpression',
          callee: ident,
          params,
        }
      }

      // TODO: parse color names
      if (colorNames[ident]) {
        const namedColor = color(ident)

        return {
          type: 'Color',
          red: namedColor.red(),
          green: namedColor.green(),
          blue: namedColor.blue(),
          alpha: namedColor.alpha(),
          format: 'keyword',
        }
      }

      return {
        type: 'Identifier',
        value: ident,
      }
    }
  }

  parseVariable() {
    if (this.currentToken.type === 'variable') {
      const isEnv = this.currentToken.value === '@'

      this.updateCurrentToken(1)

      if (this.currentToken.type === 'identifier') {
        this.isDynamic = true
        return {
          type: 'Variable',
          value: this.currentToken.value,
          environment: isEnv,
        }
      }
    }
  }
}
