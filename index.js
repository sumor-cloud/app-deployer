import deployScope from './src/deploy.js'
import loadConfig from './src/config/index.js'

const deploy = async (options) => {
  options = options || {}
  options.root = options.root || process.cwd()
  const config = await loadConfig(options.root, options.type)
  await deployScope(config)
}

export {
  deploy
}
export default {
  deploy
}
