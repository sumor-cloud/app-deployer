import loadConfig from './config/index.js'
import deploy from './deploy/index.js'

export default async (options) => {
  options = options || {}
  options.root = options.root || process.cwd()

  const config = await loadConfig(options.root, options.type)

  await deploy(config)
}
