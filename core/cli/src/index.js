#!/usr/bin/env node
import parseArgv from './options'
import command from './command'

const opts = parseArgv(process.argv)

command(opts).catch(err => {
  console.error(err)
  process.exit(1)
})
