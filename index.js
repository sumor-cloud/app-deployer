#! /usr/bin/env node

import { Command } from 'commander'
import fs from 'fs'

// ESM not support __dirname, so we need to use import.meta.url
const pkgPath = new URL('./package.json', import.meta.url)
const { version } = JSON.parse(fs.readFileSync(pkgPath))

const program = new Command()

program
  .name('ade')
  .description('App Deployer CLI Tool')
  .version(version || '0.0.0', '-v, --version')

program.command('split')
  .description('Split a string into substrings and display as an array')
  .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-s, --separator <char>', 'separator character', ',')
  .action((str, options) => {
    const limit = options.first ? 1 : undefined
    console.log(str.split(options.separator, limit))
  })

program.parse()
