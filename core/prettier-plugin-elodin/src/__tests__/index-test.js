import * as fs from 'fs'
import * as path from 'path'
import * as prettier from 'prettier'
import * as rimraf from 'rimraf'
import * as tempDir from 'temp-dir'

const fixturesDir = path.resolve(__dirname, './__fixtures__')
const resultsDir = path.resolve(__dirname, './__results__')

const fixtures = fs.readdirSync(fixturesDir).map(filePath => ({
  filepath: path.resolve(fixturesDir, filePath),
  input: fs.readFileSync(path.resolve(fixturesDir, filePath), 'utf8'),
  output: fs.readFileSync(path.resolve(resultsDir, filePath), 'utf8'),
}))

describe('Using the prettier plugin', () => {
  it('should format elodin files', () => {
    fixtures.forEach(({ input, output, filepath }) => {
      const res = prettier.format(input, {
        filepath,
        parser: 'elodin',
        plugins: [path.resolve(__dirname, '../..')],
      })

      expect(res).toEqual(output)
    })
  })
})
