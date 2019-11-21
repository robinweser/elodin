import { format } from '@elodin/format'

export default function parse(text, _, options) {
  const formatted = format(text)

  const errors = formatted.errors
  let formattedText = formatted.code

  if (errors.length > 0) {
    let formattedText = text
  }

  return {
    ast_type: 'elodin-ast',
    body: formattedText,
    error: errors[0],
    end: text.length,
    source: text,
    start: 0,
  }
}
