import Parser from './Parser'

export default function parse(input, config) {
  // TODO: reuse parser for perf
  const parser = new Parser(config)
  return parser.parse(input)
}
