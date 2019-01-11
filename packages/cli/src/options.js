import fs from 'fs'

import commander from 'commander'
import { version } from '@babel/core'
import uniq from 'lodash/uniq'
import glob from 'glob'

import pkg from '../package.json'

// commander.option(
//   '--plugins [list]',
//   'comma-separated list of plugin names',
//   collect
// )

// commander.option('--config-file [path]', 'Path to a .babelrc file to use')
// commander.option(
//   '--env-name [name]',
//   "The name of the 'env' to use when loading configs and plugins. " +
//     "Defaults to the value of BABEL_ENV, or else NODE_ENV, or else 'development'."
// )
// commander.option(
//   '--root-mode [mode]',
//   'The project-root resolution mode. ' +
//     "One of 'root' (the default), 'upward', or 'upward-optional'."
// )

// commander.option(
//   '--ignore [list]',
//   'list of glob paths to **not** compile',
//   collect
// )

// commander.option(
//   '--only [list]',
//   'list of glob paths to **only** compile',
//   collect
// )

commander.option(
  '--generator [generator]',
  'The generator used to generate output files. ' +
    'One of the official generators published as @elodin/generator-*.'
)

commander.option(
  '--adapter [adapter]',
  'The generator used to generate output files. ' +
    'One of the official generators published as @elodin/generator-*.'
)

commander.option('-w, --watch', 'Recompile files on changes')
commander.option('--skip-initial-build', 'Do not compile files before watching')

// commander.option(
//   '-d, --out-dir [out]',
//   'Compile an input directory of modules into an output directory'
// )
// commander.option(
//   '--relative',
//   'Compile into an output directory relative to input directory or file. Requires --out-dir [out]'
// )

commander.version(pkg.version)
commander.usage('[options] <files ...>')

export default function parseArgv(args) {
  //
  commander.parse(args)

  const errors = []

  let filenames = commander.args.reduce(function(globbed, input) {
    let files = glob.sync(input)
    if (!files.length) files = [input]
    return globbed.concat(files)
  }, [])

  filenames = uniq(filenames)

  filenames.forEach(function(filename) {
    if (!fs.existsSync(filename)) {
      errors.push(filename + ' does not exist')
    }
  })

  // if (commander.outDir && !filenames.length) {
  //   errors.push('--out-dir requires filenames')
  // }

  // if (commander.outFile && commander.outDir) {
  //   errors.push('--out-file and --out-dir cannot be used together')
  // }

  // if (commander.relative && !commander.outDir) {
  //   errors.push('--relative requires --out-dir usage')
  // }

  if (commander.watch) {
    if (!filenames.length) {
      errors.push('--watch requires filenames')
    }
  }

  if (commander.skipInitialBuild && !commander.watch) {
    errors.push('--skip-initial-build requires --watch')
  }

  if (errors.length) {
    console.error('babel:')
    errors.forEach(function(e) {
      console.error('  ' + e)
    })
    process.exit(2)
  }

  const opts = commander.opts()

  const elodinOptions = {
    // presets: opts.presets,
    // plugins: opts.plugins,
    // ignore: opts.ignore,
    // only: opts.only,
    generator: opts.generator,
    adapter: opts.adapter,
  }

  return {
    elodinOptions,
    cliOptions: {
      filename: opts.filename,
      filenames,
      watch: opts.watch,
      skipInitialBuild: opts.skipInitialBuild,
    },
  }
}

function booleanify(val) {
  if (val === 'true' || val == 1) {
    return true
  }

  if (val === 'false' || val == 0 || !val) {
    return false
  }

  return val
}

function collect(value, previousValue) {
  // If the user passed the option with no value, like "babel file.js --presets", do nothing.
  if (typeof value !== 'string') return previousValue

  const values = value.split(',')

  return previousValue ? previousValue.concat(values) : values
}
