import '@babel/polyfill'
import { performance } from 'perf_hooks'
import slash from 'slash'
import path from 'path'
import chalk from 'chalk'
import glob from 'glob'
import fs from 'fs'

import * as util from './util'

export default async function({ watch, clean, skipInitialBuild }) {
  let config

  const configPath = path.join(process.cwd(), './elodin.config.js')
  try {
    config = require(configPath)
  } catch (e) {
    console.error(
      chalk`{bold.red Unable to locate the elodin config file at ${configPath}.}
   
{red A valid elodin configuration must be passed.
Start by creating a {bold elodin.config.js} file.
For further information check out {underline https://elodin.dev/docs/setup/getting-started}.}`
    )

    console.error(e)

    return false
  }

  if (!config.generator) {
    console.error(
      chalk`{bold.red Unable to find a generator in your elodin configuration.}
   
{red A generator is required to be able to compile elodin files.
For further information check out {underline https://elodin.dev/docs/setup/configuration}.}`
    )

    return false
  }

  if (!config.sources && !config.dependencies) {
    console.error(
      chalk`{bold.red Unable to find neither sources nor dependencies in your elodin configuration.}
   
{red Nothing to compile. Add add sources and/or dependecies array to include files/packages.
For further information check out {underline https://elodin.dev/docs/setup/configuration}.}`
    )

    return false
  }

  const { sources = [], dependencies = [], generator } = config

  // we deduplicate folders to avoid unneccessary compiles
  // TODO: warn user about duplication
  const folders = [
    ...sources.filter((source, index, arr) => arr.indexOf(source) === index),
    // TODO: resolve dependencie sources
    // ...dependencies
    //   .filter((dependency, index, arr) => arr.indexOf(dependency) === index)
    //   .map(dependency => path.join('/node_modules/' + dependency)),
  ]

  // clean files
  if (clean) {
    if (generator.filePattern) {
      let didClean = false

      config.generator.filePattern.map(v => {
        try {
          const files = folders.reduce((files, source) => {
            return [...files, ...glob.sync(path.join(process.cwd(), source, v))]
          }, [])

          if (files.length > 0) {
            console.log('Cleaning ' + files.length + ' files.')
            files.forEach(fs.unlinkSync)
            didClean = true
          }
        } catch (e) {
          // TODO: throw sth
          // console.log(e)
        }
      })

      if (didClean) {
        console.log('')
      }
    }
  }

  async function walk(filenames) {
    console.log(chalk`{cyan >>>> Start compiling}`)

    const _filenames = []
    let start = performance.now()

    filenames.forEach(filename => {
      if (!fs.existsSync(filename)) return

      const stat = fs.statSync(filename)
      if (stat.isDirectory()) {
        const dirname = filename

        util.readdirForCompilable(filename).forEach(function(filename) {
          _filenames.push(path.join(dirname, filename))
        })
      } else {
        _filenames.push(filename)
      }
    })

    let files = 0

    const compileConfig = {
      ...config,
      errors: watch ? 'log' : 'throw',
      errorCount: 0,
    }

    const results = await Promise.all(
      _filenames.map(async function(filename) {
        let sourceFilename = filename

        sourceFilename = slash(sourceFilename)

        const didCompile = await util.compile(filename, compileConfig)

        files++
      })
    )

    let end = performance.now()

    // if (successLog.length + failLog.length > 0) {
    //   console.log(successLog + failLog)
    // }

    let fail = compileConfig.errorCount

    if (files > 0) {
      console.log(
        chalk`{cyan >>>> Finish compiling (${files} file${
          files > 1 ? 's' : ''
        }${
          fail > 0 ? chalk`, {red ${fail} error${fail > 1 ? 's' : ''}}` : ''
        })} ${Math.round(end - start)} mseconds`
      )
    }
  }

  async function files(filenames) {
    if (!skipInitialBuild) {
      await walk(filenames)
    }

    if (watch) {
      const chokidar = util.requireChokidar()
      chokidar
        .watch(filenames, {
          persistent: true,
          ignoreInitial: true,
          awaitWriteFinish: {
            stabilityThreshold: 50,
            pollInterval: 10,
          },
        })
        .on('all', function(type, filename) {
          if (!util.isCompilableExtension(filename)) {
            return
          }

          if (type === 'add' || type === 'change') {
            walk(filenames).catch(err => {
              console.error(err)
            })
          }
        })
    }
  }

  await files(folders)
}
