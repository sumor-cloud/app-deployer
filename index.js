import loadConfig from './src/config/index.js'
import monitoring from './src/monitor/index.js'
import deployEntry from './src/deploy/index.js'

const config = async () => {
  const configData = await loadConfig(process.cwd())

  console.log('Config Data:')
  console.log(JSON.stringify(configData, null, 4))
}

const deploy = async () => {
  const config = await loadConfig()
  config.root = process.cwd()
  await deployEntry(config)
}

const monitor = async () => {
  const config = await loadConfig()

  console.log('\n\n ==================== 获取服务器运行状态 ==================== \n')
  for (const server in config.server) {
    const system = await monitoring(config.server[server])
    console.log(`服务器${server}运行状态`)
    console.log(system)
  }
}

export { config, deploy, monitor }

export default {
  config,
  deploy,
  monitor
}
