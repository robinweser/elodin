import { format } from '@elodin/format'

export default function parse(text) {
  const formattedText = format(text)

  return {
    ast_type: 'elodin-ast',
    body: formattedText,
    end: text.length,
    source: text,
    start: 0,
  }
}
