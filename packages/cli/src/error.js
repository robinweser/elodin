import chalk from 'chalk'

export function logSyntaxError({ lineNumber, line, message, count, path }) {
  console.error(chalk`
{red.bold Error number ${count}}
{cyan ${path}:${lineNumber}}

{red ${lineNumber}} {grey |} ${line}

${message}`)
}
