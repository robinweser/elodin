import readdirRecursive from 'fs-readdir-recursive'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

import { transformFile, errorTypes, formatFromAST } from '@elodin/core'

import { logSyntaxError } from './error'

export function chmod(src, dest) {
  fs.chmodSync(dest, fs.statSync(src).mode)
}

export function readdir(dirname, includeDotfiles, filter) {
  return readdirRecursive(dirname, (filename, _index, currentDirectory) => {
    const stat = fs.statSync(path.join(currentDirectory, filename))

    if (stat.isDirectory()) return true

    return (
      (includeDotfiles || filename[0] !== '.') && (!filter || filter(filename))
    )
  })
}

export function readdirForCompilable(dirname, includeDotfiles) {
  return readdir(dirname, includeDotfiles, isCompilableExtension)
}

export function isCompilableExtension(filename) {
  return path.extname(filename) === '.elo'
}

// export function transform(filename, code, opts) {
//   opts = {
//     ...opts,
//     filename,
//   }

//   return new Promise((resolve, reject) => {

//     babel.transform(code, opts, (err, result) => {
//       if (err) reject(err)
//       else resolve(result)
//     })
//   })
// }

export function compile(filename, opts) {
  const log = errors =>
    errors.forEach(error => {
      const count = ++opts.errorCount

      if (error.type === errorTypes.INVALID_PROPERTY) {
        const { property, value, path, line, format } = error

        logSyntaxError({
          count,
          path,
          lineNumber: line,
          line: chalk`{red ${property}}: ${formatFromAST(value)}`,
          message: chalk`The property {bold ${property}} is not a valid ${format} property.
{dim Check {underline https://elodin.dev/docs/language/styles#${format}} for a list of available properties.}`,
        })
      } else if (error.type === errorTypes.INVALID_VALUE) {
        const { property, value, path, line, format } = error

        logSyntaxError({
          count,
          path,
          lineNumber: line,
          line: chalk`${property}: {red ${formatFromAST(value)}}`,
          message: chalk`The property ${property} does not accept the value {bold ${formatFromAST(
            value
          )}}.
{dim Check {underline https://elodin.dev/docs/language/styles#${format}} for a list of available values.}`,
        })
      } else {
        const { line, path, message, source, token } = error

        const lineCode = source
          ? source
              .substr(0, token.end)
              .split('\n')
              .pop()
          : ''

        logSyntaxError({
          count,
          path,
          lineNumber: line,
          line: chalk`{red ${lineCode}}`,
          message: chalk`${message}`,
        })
      }
    })

  return new Promise((resolve, reject) =>
    transformFile(filename, { ...opts, log }, resolve)
  )
}

export function deleteDir(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      const curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteDir(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

process.on('uncaughtException', function(err) {
  console.error(err)
  process.exit(1)
})

export function requireChokidar() {
  try {
    return require('chokidar')
  } catch (err) {
    console.error(
      'The optional dependency chokidar failed to install and is required for ' +
        '--watch. Chokidar is likely not supported on your platform.'
    )
    throw err
  }
}
