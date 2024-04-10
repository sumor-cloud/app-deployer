import load from '../config/load.js'
import convert from '../config/convert.js'
import deploy from './entry/index.js'

export default async (options) => {
  options = options || {}
  options.root = options.root || process.cwd()

  const scopeConfig = await load(options.root, 'scope')
  if (options.type) {
    await convert(options.root, 'scope', options.type)
  }

  const scaleConfig = await load(options.root, 'scale')
  if (options.type) {
    await convert(options.root, 'scale', options.type)
  }

  // console.log(scopeConfig, scaleConfig);
  await deploy(scopeConfig, scaleConfig)
}
