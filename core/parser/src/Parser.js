import tokenize from 'tokenize-sync'
import color from 'color'

import validateDeclaration from './validateDeclaration'
import validateFunction from './validateFunction'
import errorTypes from './errorTypes'
import colorNames from './colorNames'

const ruleMap = {
  minus: /^[-]$/,
  comment: /^[#].*$/,
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
    this.strictMode = config.strictMode || {}
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

    // ensure we always skip comments
    this.parseComment()
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

  getComments() {
    this.parseComment()
    const comments = [...this.comments]
    this.comments = []

    return comments
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
    this.comments = []
    this.updateCurrentToken()

    const file = {
      type: 'File',
      body: [],
    }

    while (this.isRunning()) {
      this.parent = undefined

      const comments = this.getComments()
      const node = this.parseStyle() || this.parseVariant()

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
              'Invalid Syntax. Top-level constructs can only be view, text or variant.',
          },
          true
        )
      }

      file.body.push({ ...node, comments })
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

  parseComment() {
    if (this.currentToken && this.currentToken.type === 'comment') {
      this.comments.push(this.currentToken.value.substr(1))
      this.updateCurrentToken(1)
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
        const comments = this.getComments()
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

          return
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

        body.push({ ...node, comments })
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
        const comments = this.getComments()
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

        body.push({ ...variant, comments })
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
                  hint: validation.hint,

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
                  hint: validation.hint,
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

        const node = {
          type: 'Declaration',
          raw: isRawDeclaration,
          dynamic: this.isDynamic,
          property: isRawDeclaration ? property.slice(2) : property,
          value,
        }

        if (isRawDeclaration && this.strictMode.rawDeclaration) {
          this.addError(
            {
              type: errorTypes.STRICT_MODE_RAW_DECLARATION,
              message: `Strict mode: No raw declarations.`,
              node,
            },
            true
          )
        }

        return node
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

        const validation = validateFunction(ident, params)

        if (typeof validation === 'object') {
          this.addError(
            {
              ...validation,
              type: 'INVALID_FUNCTION',
            },
            false
          )
        }

        const node = {
          type: 'FunctionExpression',
          callee: ident,
          params,
        }

        if (ident === 'raw' && this.strictMode.rawValue) {
          this.addError(
            {
              type: errorTypes.STRICT_MODE_RAW_VALUE,
              message: `Strict mode: No raw values.`,
              node,
            },
            true
          )
        }

        return node
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
        const node = {
          type: 'Variable',
          value: this.currentToken.value,
          environment: isEnv,
        }

        if (!isEnv && this.strictMode.variable) {
          this.addError(
            {
              type: errorTypes.STRICT_MODE_VARIABLE,
              message: `Strict mode: No variables.`,
              node,
            },
            true
          )
        }

        return node
      }
    }
  }
}
