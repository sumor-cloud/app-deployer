import load from './load.js'
import convert from './convert.js'
import configFormatter from './formatter/index.js'

export default async (options) => {
  options = options || {}
  const root = options.root || process.cwd()
  const type = options.type

  const config = (await load(root, 'scope')) || {}
  if (type) {
    await convert(root, 'scope', type)
  }

  const scale = await load(root, 'scale')
  if (scale) {
    config.scale = scale
    if (type) {
      await convert(root, 'scale', type)
    }
  }

  // 补全数据
  for (const i in config.server) {
    config.server[i].name = i
  }

  Object.assign(config, configFormatter(config))

  return config
}
