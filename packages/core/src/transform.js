import { join, dirname, basename } from 'path'
import readTransformWrite from 'read-transform-write'

import { parse } from '@elodin/parser'
import { traverse } from '@elodin/traverser'

export default function transform(code, options = {}) {
  const plugins = options.plugins || []
  const generator = options.generator

  const transform = file => write => {
    const ast = traverse(parse(file), plugins)
    const files = generator(ast, inputPath)

    const inputDir = dirname(inputPath)
    const inputFile = basename(inputPath)

    const { _root, ...otherFiles } = files

    write(join(inputDir, inputFile + '.js'), _root)

    for (let fileName in otherFiles) {
      write(join(inputDir, fileName), otherFiles[fileName])
    }
  }
}
