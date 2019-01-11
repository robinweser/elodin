import tokenize from 'tokenize-sync'
import { validateDeclaration } from '@elodin/validator'

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

export default class Parser {
  constructor(config = {}) {
    this.config = config
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
    return this.currentPosition < this.tokens.length
  }

  parse(input) {
    this.tokens = tokenize(input.trim(), ruleMap, 'unknown').filter(
      token => token.type !== 'whitespace'
    )

    // initialize/reset indices
    this.input = input
    this.currentPosition = 0
    this.updateCurrentToken()

    const file = {
      type: 'File',
      body: [],
    }

    while (this.isRunning()) {
      const node = this.parseStyle() || this.parseFragment()
      file.body.push(node)
    }

    return file
  }

  parseStyle() {
    if (
      this.currentToken.type === 'identifier' &&
      this.currentToken.value === 'style'
    ) {
      this.updateCurrentToken(1)

      const name = this.parseStyleName()
      const body = this.parseStyleBody()

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

      while (this.currentToken.type !== 'curly_bracket') {
        const node = this.parseDeclaration() || this.parseConditional()

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
      const body = this.parseFragmentBody()

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

      while (this.currentToken.type !== 'curly_bracket') {
        body.push(this.parseDeclaration())
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
        const valueToken = this.currentToken
        const value = this.parseValue()

        if (!isRawDeclaration) {
          const validation = validateDeclaration(property, value, value.value)

          if (typeof validation === 'object') {
            if (validation.type === 'property') {
              throw new SyntaxError(
                validation.message +
                  '\n' +
                  this.input.substring(
                    propertyToken.start + 1,
                    valueToken.end + 1
                  ) +
                  '   /components/Header.elo (10:' +
                  propertyToken.start +
                  ')\n' +
                  '↑'.repeat(property.length)
              )
            }

            if (validation.type === 'value' && value.type !== 'Variable') {
              throw new SyntaxError(
                validation.message +
                  '\n' +
                  this.input.substring(
                    propertyToken.start + 1,
                    valueToken.end + 1
                  ) +
                  '   /components/Header.elo (10:' +
                  propertyToken.start +
                  ')\n' +
                  '↑'.repeat(property.length) +
                  '\n' +
                  validation.hint
              )
            }
          }
        }

        return {
          type: 'Declaration',
          raw: isRawDeclaration,
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
      const body = this.parseStyleBody()

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
          integer: integer,
          fractional: nextNextToken.value,
        }
      }

      return {
        type: 'NumericLiteral',
        value: integer,
      }
    }

    if (this.currentToken.type === 'floating_point') {
      this.updateCurrentToken(1)

      if (this.currentToken.type === 'number') {
        return {
          type: 'Float',
          integer: 0,
          fractional: this.currentToken.value,
        }
      }
    }

    return this.parseIdentifier() || this.parseVariable()
  }

  parseIdentifier() {
    if (this.currentToken.type === 'identifier') {
      const ident = this.currentToken.value

      const nextToken = this.getNextToken(1)
      if (nextToken.type === 'round_bracket' && nextToken.value === '(') {
        this.updateCurrentToken(2)

        const params = []

        while (this.currentToken.type !== 'round_bracket') {
          params.push(this.parseValue())
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
        return {
          type: 'Variable',
          value: this.currentToken.value,
          environment: isEnv,
        }
      }
    }
  }
}
