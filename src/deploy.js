import updateRoute from './route/index.js'
import updateSSL from './updateSSL/index.js'
import monitor from './monitor/index.js'

import checkVersions from './version/check/index.js'
import scale from './scale/index.js'
import SSH from './ssh/index.js'

export default async (config) => {
  try {
    const startTime = Date.now()
    console.log('正在启动部署')

    // 更新证书
    console.log('\n\n ==================== 更新证书 ==================== \n')
    await updateSSL(config)

    // 获取服务器运行状态
    console.log('\n\n ==================== 获取服务器运行状态 ==================== \n')
    for (const server in config.server) {
      const system = await monitor(config.server[server])
      console.log(`服务器${server}运行状态`)
      console.log(system)
    }

    // 获取服务器实例状态
    console.log('\n\n ==================== 获取服务器实例状态 ==================== \n')
    const instances = {}
    for (const server in config.server) {
      const ssh = new SSH(config.server[server])
      let serverInstances = await ssh.docker.instances()
      // serverInstances = serverInstances.sort((x, y) => x.instanceId > y.instanceId ? 1 : -1);
      serverInstances = serverInstances.filter((obj) => obj.instanceId.indexOf('sumor_app') === 0)
      instances[server] = serverInstances.map((o) => o.instanceId)
      await ssh.disconnect()
    }
    for (const server in instances) {
      console.log(`服务器${server}现存实例列表`)
      for (const i in instances[server]) {
        console.log(`- ${instances[server][i]}`)
      }
    }

    // 检查应用版本
    console.log('\n\n ==================== 检查应用版本 ==================== \n')
    const versions = await checkVersions(config)

    // 部署应用
    console.log('\n\n ==================== 部署应用 ==================== \n')
    await scale(config, versions, instances)

    console.log('\n\n ==================== 实例情况 ==================== \n')
    console.log(instances)
    await updateRoute(config, instances)

    console.log(`所有应用已完成部署 ${Date.now() - startTime}ms`)
  } catch (e) {
    console.log(e)
  }
}
