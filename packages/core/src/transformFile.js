import { join, dirname, basename } from 'path'
import readTransformWrite from 'read-transform-write'

import { parse } from '@elodin/parser'
import { traverse } from '@elodin/traverser'

export default function transformFile(inputPath, options, callback) {
  const plugins = options.plugins || []
  const generator = options.generator
  const adapter = options.adapter
  const errors = options.errors || 'throw'

  if (!generator) {
    throw new Error('No generator passed.')
  }

  const gen = require('@elodin/generator-' + generator).default

  const transform = file => write => {
    let ast
    try {
      ast = traverse(parse(file), plugins)
    } catch (e) {
      if (errors === 'throw') {
        throw e
      }

      if (errors === 'log') {
        console.log(e)
      }

      if (callback) {
        callback()
      }

      return
    }

    const files = gen({ adapterName: adapter })(ast, inputPath)

    const inputDir = dirname(inputPath)
    const inputFile = basename(inputPath)

    const { _root, ...otherFiles } = files

    write(join(inputDir, inputFile + '.js'), _root, files.length)

    for (let fileName in otherFiles) {
      write(join(inputDir, fileName), otherFiles[fileName], files.length)
    }
  }

  readTransformWrite(inputPath, transform, ({ output, outputPath, isDone }) => {
    //console.log(`Written ${outputPath}.`)
    if (isDone && callback) {
      callback()
    }
  })
}
