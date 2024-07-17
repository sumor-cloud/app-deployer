import format from './format.js'
import { load } from '@sumor/config'

export default async root => {
  root = root || process.cwd()
  const config = await load(root, 'scope')
  config.root = root
  // 补全数据
  for (const i in config.server) {
    config.server[i].name = i
  }
  Object.assign(config, format(config))
  return config
}
