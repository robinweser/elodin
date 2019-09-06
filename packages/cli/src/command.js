import '@babel/polyfill'
import defaults from 'lodash/defaults'
import outputFileSync from 'output-file-sync'
import { sync as mkdirpSync } from 'mkdirp'
import rimraf from 'rimraf'
import slash from 'slash'
import path from 'path'
import fs from 'fs'

import * as util from './util'

export default async function({ cliOptions, elodinOptions }) {
  let config

  const configPath = path.join(process.cwd(), elodinOptions.configFile)
  try {
    config = require(configPath)
  } catch (e) {
    console.error(
      `[ERROR] Tried to find the elodin config file at ${configPath}. 
An elodin configuration must be passed.
Start by creating a elodin.config.js file.`
    )
    return false
  }

  const filenames = cliOptions.filenames

  if (cliOptions.clean) {
    if (config.generator.filePattern) {
      try {
        config.generator.filePattern
          .map(v => process.cwd() + '/**/' + v)
          .map(path => rimraf.sync(path))

        console.log('Successfully cleaned all files.')
      } catch (e) {
        console.log(e)
        // TODO: throw sth
      }
    }
  }

  async function walk(filenames) {
    const _filenames = []

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

    let success = 0
    let fail = 0
    const results = await Promise.all(
      _filenames.map(async function(filename) {
        let sourceFilename = filename

        sourceFilename = slash(sourceFilename)

        const didCompile = await util.compile(filename, {
          ...config,
          errors: cliOptions.watch ? 'log' : 'throw',
        })

        if (didCompile) {
          success++
        } else {
          fail++
        }
      })
    )

    const successLog =
      success > 0
        ? 'Successfully compiled ' +
          success +
          ' file' +
          (success > 1 ? 's' : '') +
          '. '
        : ''

    const failLog =
      fail > 0
        ? (successLog.length > 0 ? '\n' : '') +
          fail +
          ' file' +
          (fail > 1 ? 's' : '') +
          ' failed to compile.'
        : ''

    if (successLog.length + failLog.length > 0) {
      console.log(successLog + failLog)
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
