#! /usr/bin/env node

import { Command } from 'commander'
import fs from 'fs'

import entry from './index.js'

// ESM not support __dirname, so we need to use import.meta.url
const pkgPath = new URL('./package.json', import.meta.url)
const { version } = JSON.parse(fs.readFileSync(pkgPath))

const program = new Command()

program
  .name('ade')
  .description('App Deployer CLI Tool')
  .version(version || '0.0.0', '-v, --version')

program
  .command('config')
  .description('Config')
  .action(async () => {
    await entry.config()
  })

program
  .command('deploy')
  .description('Deploy')
  .action(async options => {
    await entry.deploy(options)
  })

program
  .command('monitor')
  .description('Monitor')
  .action(async options => {
    await entry.monitor(options)
  })

program.parse()
