import '@babel/polyfill'
import defaults from 'lodash/defaults'
import outputFileSync from 'output-file-sync'
import { sync as mkdirpSync } from 'mkdirp'
import slash from 'slash'
import path from 'path'
import fs from 'fs'

import * as util from './util'

export default async function({ cliOptions, elodinOptions }) {
  const filenames = cliOptions.filenames

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

    let count = 0
    const results = await Promise.all(
      _filenames.map(async function(filename) {
        let sourceFilename = filename

        sourceFilename = slash(sourceFilename)

        count++

        return await util.compile(filename, {
          ...elodinOptions,
          errors: cliOptions.watch ? 'log' : 'throw',
        })
      })
    )

    console.log(
      'Successfully compiled ' +
        count +
        ' file' +
        (count > 1 ? 's' : '') +
        ' with elodin.'
    )
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
