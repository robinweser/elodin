import tokenize from 'tokenize-sync'
import { validateDeclaration } from '@elodin/validator'

const ruleMap = {
  minus: /^[-]$/,
  hash: /^[#]$/,
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

const OPERATOR_REGEX = /^(>|<|>=|>=|=)$/

const errorTypes = {
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  DUPLICATE_MODULE: 'DUPLICATE_MODULE',
  INVALID_PROPERTY: 'INVALID_PROPERTY',
  INVALID_VALUE: 'INVALID_VALUE',
}

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
      this.errors.push({
        ...this.context,
        ...error,
        token: this.currentToken,
      })
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
    this.updateCurrentToken()

    const file = {
      type: 'File',
      body: [],
    }

    while (this.isRunning()) {
      const node =
        this.parseStyle() || this.parseFragment() || this.parseVariant()

      if (node) {
        const duplicate = file.body.find(n => n.name === node.name)

        if (duplicate) {
          this.addError(
            {
              type: errorTypes.DUPLICATE_MODULE,
              hint: `The  ${node.type.toLowerCase()} '${
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
          },
          true
        )
      }

      file.body.push(node)
    }

    return {
      errors: this.errors,
      ast: file,
    }
  }

  parseStyle() {
    if (
      this.currentToken.type === 'identifier' &&
      this.currentToken.value === 'style'
    ) {
      this.updateCurrentToken(1)

      const name = this.parseStyleName()

      if (!name) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
          },
          true
        )
      }

      if (name && name.charAt(0).toUpperCase() !== name.charAt(0)) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            hint: 'Style names must begin with an uppercase letter.',
            name,
          },
          true
        )
      }

      const body = this.parseStyleBody()

      if (!body) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
          },
          true
        )
      }

      return {
        type: 'Style',
        name,
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
              type: errorTypes.SYNTAX_ERROR,
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
          },
          true
        )
      }

      if (name && name.charAt(0).toUpperCase() !== name.charAt(0)) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            hint: 'Fragment names must begin with an uppercase letter.',
            name,
          },
          true
        )
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
          },
          true
        )
      }

      if (name && name.charAt(0).toUpperCase() !== name.charAt(0)) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
            hint: 'Variant names must begin with an uppercase letter.',
            name,
          },
          true
        )
      }

      const body = this.parseVariantBody()

      if (!body) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
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
              hint: 'Variants can only define identifier variations.',
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
              hint: 'Variation values must begin with an uppercase letter.',
              variation: variant.value,
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
            },
            true
          )
        }

        if (!isRawDeclaration) {
          const validation = validateDeclaration(property, value, value.value)

          if (typeof validation === 'object') {
            if (validation.type === 'property') {
              this.errors.push({
                type: errorTypes.INVALID_PROPERTY,
                property,
                value,
              })
            }

            if (validation.type === 'value' && value.type !== 'Variable') {
              this.errors.push({
                type: errorTypes.INVALID_VALUE,
                property,
                value,
              })
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
          },
          true
        )
      }

      const body = this.parseStyleBody()

      if (!body) {
        this.addError(
          {
            type: errorTypes.SYNTAX_ERROR,
          },
          true
        )
      }

      this.updateCurrentToken(-1)

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

    return this.parseNumber() || this.parseIdentifier() || this.parseVariable()
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
        type: 'NumericLiteral',
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

  parseIdentifier() {
    if (this.currentToken.type === 'identifier') {
      const ident = this.currentToken.value

      const nextToken = this.getNextToken(1)
      if (nextToken.type === 'round_bracket' && nextToken.value === '(') {
        this.updateCurrentToken(2)

        const params = []

        while (this.isRunning() && this.currentToken.type !== 'round_bracket') {
          const param = this.parseValue()

          if (!param) {
            this.addError(
              {
                type: errorTypes.SYNTAX_ERROR,
              },
              true
            )
          }
          params.push(param)
          this.updateCurrentToken(1)
        }

        return {
          type: 'FunctionExpression',
          callee: ident,
          params,
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
