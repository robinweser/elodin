import '@babel/polyfill'
import defaults from 'lodash/defaults'
import outputFileSync from 'output-file-sync'
import { sync as mkdirpSync } from 'mkdirp'
import { performance } from 'perf_hooks'
import rimraf from 'rimraf'
import slash from 'slash'
import path from 'path'
import chalk from 'chalk'
import glob from 'glob'
import fs from 'fs'

import * as util from './util'

export default async function({ cliOptions, elodinOptions }) {
  let config

  const configPath = path.join(process.cwd(), elodinOptions.configFile)
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

  const filenames = cliOptions.filenames

  if (!config.generators) {
    console.error(
      chalk`{bold.red Unable to find a generator in your elodin configuration.}
   
{red A generator is required to be able to compile elodin files.
For further information check out {underline https://elodin.dev/docs/setup/configuration}.}`
    )

    return false
  }

  if (cliOptions.clean) {
    config.generators.forEach(generator => {
      if (generator.filePattern) {
        let didClean = false
        const ignorePattern = generator.ignorePattern || []
        generator.filePattern.map(v => {
          try {
            const files = glob.sync(process.cwd() + '/**/' + v)
            const actualFiles = files.filter(
              file =>
                ignorePattern.find(pattern => file.indexOf(pattern) !== -1) ===
                undefined
            )

            if (actualFiles.length > 0) {
              console.log('Cleaning ' + actualFiles.length + ' files.')
              actualFiles.forEach(fs.unlinkSync)
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
    })
  }

  async function walk(filenames) {
    console.log(chalk`{cyan >>>> Start compiling}`)

    const _filenames = []
    let start = performance.now()

    filenames.forEach(function(filename) {
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
      errors: cliOptions.watch ? 'log' : 'throw',
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
    if (!cliOptions.skipInitialBuild) {
      await walk(filenames)
    }

    if (cliOptions.watch) {
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

  if (cliOptions.filenames.length) {
    await files(cliOptions.filenames)
  } else {
  }
  // async function write(src, base) {
  //   let relative = path.relative(base, src)

  //   if (!util.isCompilableExtension(relative)) {
  //     return false
  //   }

  //   const dest = getDest(relative, base)

  //   try {
  //     const res = await util.compile(
  //       src,
  //       defaults(
  //         {
  //           sourceFileName: slash(path.relative(dest + '/..', src)),
  //         },
  //         elodinOptions
  //       )
  //     )

  //     if (!res) return false

  //     util.chmod(src, dest)

  //     return true
  //   } catch (err) {
  //     if (cliOptions.watch) {
  //       console.error(err)
  //       return false
  //     }

  //     throw err
  //   }
  // }

  // function getDest(filename, base) {
  //   if (cliOptions.relative) {
  //     return path.join(base, cliOptions.outDir, filename)
  //   }
  //   return path.join(cliOptions.outDir, filename)
  // }

  // async function handleFile(src, base) {
  //   return await write(src, base)
  // }

  // async function handle(filenameOrDir) {
  //   if (!fs.existsSync(filenameOrDir)) return 0

  //   const stat = fs.statSync(filenameOrDir)

  //   if (stat.isDirectory()) {
  //     const dirname = filenameOrDir

  //     let count = 0

  //     const files = util.readdir(dirname, false)

  //     for (const filename of files) {
  //       const src = path.join(dirname, filename)

  //       const written = await handleFile(src, dirname)
  //       if (written) count += 1
  //     }

  //     return count
  //   } else {
  //     const filename = filenameOrDir
  //     const written = await handleFile(filename, path.dirname(filename))

  //     return written ? 1 : 0
  //   }
  // }

  // if (!cliOptions.skipInitialBuild) {
  //   let compiledFiles = 0
  //   for (const filename of cliOptions.filenames) {
  //     compiledFiles += await handle(filename)
  //   }

  //   console.log(
  //     `Successfully compiled ${compiledFiles} ${
  //       compiledFiles !== 1 ? 'files' : 'file'
  //     } with Babel.`
  //   )
  // }

  // if (cliOptions.watch) {
  //   const chokidar = util.requireChokidar()

  //   filenames.forEach(function(filenameOrDir) {
  //     const watcher = chokidar.watch(filenameOrDir, {
  //       persistent: true,
  //       ignoreInitial: true,
  //       awaitWriteFinish: {
  //         stabilityThreshold: 50,
  //         pollInterval: 10,
  //       },
  //     })

  //     ;['add', 'change'].forEach(function(type) {
  //       watcher.on(type, function(filename) {
  //         handleFile(
  //           filename,
  //           filename === filenameOrDir
  //             ? path.dirname(filenameOrDir)
  //             : filenameOrDir
  //         ).catch(err => {
  //           console.error(err)
  //         })
  //       })
  //     })
  //   })
  // }
}
