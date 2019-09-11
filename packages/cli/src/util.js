import readdirRecursive from 'fs-readdir-recursive'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

import { transformFile, errorTypes, formatFromAST } from '@elodin/core'

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
      if (error.type === errorTypes.INVALID_PROPERTY) {
        const { property, value, path, line, format, name } = error

        const count = ++opts.errorCount
        console.error(chalk`
{red.bold Error number ${count}}
{cyan ${path}} {grey ${line}}

{red ${line}} {grey |} {red ${property}}: ${formatFromAST(value)}

The property {bold ${property}} is not a valid ${format} property.
{dim Check {underline https://elodin.dev/docs/language/styles#${format}} for a list of available properties.}`)
      } else if (error.type === errorTypes.INVALID_VALUE) {
        const { property, value, path, line, format, name } = error

        const count = ++opts.errorCount
        console.error(chalk`
{red.bold Error number ${count}}
{cyan ${path}} {grey ${line}}
{red ${line}} {grey |} ${property}: {red ${formatFromAST(value)}}

The property ${property} does not accept the value {bold ${formatFromAST(
          value
        )}}.
{dim Check {underline https://elodin.dev/docs/language/styles#${format}} for a list of available values.}`)
      } else {
        // TODO: beautify more message
        console.error(chalk`{red ${error.message}}`)
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
