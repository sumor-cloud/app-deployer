#! /usr/bin/env node

import { Command } from 'commander'
import fs from 'fs'

import deploy from './src/deploy.js'
import loadConfig from './src/config/index.js'

// ESM not support __dirname, so we need to use import.meta.url
const pkgPath = new URL('./package.json', import.meta.url)
const { version } = JSON.parse(fs.readFileSync(pkgPath))

const program = new Command()

program
  .name('ade')
  .description('App Deployer CLI Tool')
  .version(version || '0.0.0', '-v, --version')

program
  .command('deploy')
  .description('Deploy')
  .option('-t, --type [type]', 'Target configuration file type, such as yaml, json')
  .action(async (options) => {
    options = options || {}
    options.root = options.root || process.cwd()
    const config = await loadConfig(options.root, options.type)
    await deploy(config)
  })

program.parse()
