import commander from 'commander'

import pkg from '../package.json'

commander.option('-w, --watch', 'Recompile files on changes')
commander.option('-c, --clean', 'Remove old files before compilation')
commander.option(
  '-sib, --skip-initial-build',
  'Do not compile files before watching'
)

commander.version(pkg.version)
commander.usage('[options]')

export default function parseArgv(args) {
  commander.parse(args)
  const opts = commander.opts()

  return {
    watch: opts.watch,
    clean: opts.clean,
    skipInitialBuild: opts.skipInitialBuild,
  }
}
