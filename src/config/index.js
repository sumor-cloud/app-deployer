import load from './load.js'
import convert from './convert.js'
import configFormatter from './formatter/index.js'

export default async (root, type) => {
  const config = await load(root, 'scope')

  if (type) {
    await convert(root, 'scope', type)
  }

  const scale = await load(root, 'scale')
  if (type) {
    await convert(root, 'scale', type)
  }

  // 补全数据
  for (const i in config.server) {
    config.server[i].name = i
  }

  config.scale = scale
  Object.assign(config, configFormatter(config))

  return config
}
