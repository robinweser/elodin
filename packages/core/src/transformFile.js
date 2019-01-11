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
    const parsed = parse(file)

    if (parsed.errors.length > 0) {
      if (parsed.errors === 'throw') {
        throw new SyntaxError(parsed.errors[0])
      }

      if (errors === 'log') {
        console.log(parsed.errors[0])
      }

      if (callback) {
        callback()
      }

      return
    }

    const ast = traverse(parsed.ast, plugins)
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
