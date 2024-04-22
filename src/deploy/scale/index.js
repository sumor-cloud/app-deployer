import fse from 'fs-extra'
import SSH from '../../ssh/index.js'
import updateSite from '../site/index.js'
import deployNode from './deployNode.js'
import cleanup from './cleanup.js'
import OperateInstances from './operateInstances.js'
import checkVersions from './version/check/index.js'

export default async (config, instances) => {
  const versions = await checkVersions(config)
  const instanceOperator = new OperateInstances(config, instances)

  const buildGenerated = {}
  const imageGenerated = {}
  await fse.remove(`${process.cwd()}/tmp/env`)

  for (const envApp of config.live) {
    const { env, app, domain, version: liveVersion } = envApp

    const invalidVersionInstances = instanceOperator.invalidVersion(env, app)
    for (const server in invalidVersionInstances) {
      const serverOutOfVersionInstances = invalidVersionInstances[server]
      console.log(`正在清除${env}环境应用${app}在服务器${server}中的过期实例`)
      instanceOperator.remove(server, serverOutOfVersionInstances)
      await cleanup(config, instanceOperator.instances, server, serverOutOfVersionInstances)
    }

    console.log(`正在部署${env}环境应用${app}，上线版本：${liveVersion || '无'}`)
    for (const version in envApp.instance) {
      for (const server in envApp.instance[version]) {
        const targetSize = envApp.instance[version][server]

        console.log(`计划部署${version}版本${targetSize}个实例到${server}服务器`)
        const serverInstances = instanceOperator.current(server, env, app, version)
        const currentSize = serverInstances.length

        if (currentSize < targetSize) {
          const diffSize = targetSize - currentSize
          console.log(`当前实例个数：${currentSize}，需要扩容${diffSize}个`)
          for (let i = 0; i < diffSize; i++) {
            console.log(`正在扩容第${i + 1}个`)
            const versionInfo = versions[app][version]
            if (versionInfo.beta && !buildGenerated[`${app}|${version}`]) {
              const buildPath = `${process.cwd()}/tmp/build/${app}/${versionInfo.name}`
              await fse.remove(buildPath)
              buildGenerated[`${app}|${version}`] = true
            }
            if (versionInfo.beta && !imageGenerated[`${app}|${version}|${server}`]) {
              const ssh = new SSH(config.server[server])
              await ssh.docker.removeImage(app, version)
              await ssh.disconnect()
              imageGenerated[`${app}|${version}|${server}`] = true
            }

            const dockerId = await deployNode({
              server: config.server[server],
              app,
              env,
              git: config.source[app],
              version: versionInfo,
              domain
            })
            instanceOperator.instances[server].unshift(dockerId)
            await updateSite(config, instanceOperator.instances)
          }
          console.log(`扩容${diffSize}个完成`)
        } else if (currentSize > targetSize) {
          const diffSize = currentSize - targetSize
          console.log(`当前实例个数：${currentSize}，需要缩减${diffSize}个`)
          const cutInstances = serverInstances.slice(targetSize, currentSize)
          instanceOperator.remove(server, cutInstances)
          await cleanup(config, instanceOperator.instances, server, cutInstances)
          console.log(`缩减${diffSize}个完成`)
        } else {
          console.log('实例数量已符合计划，无需修改')
        }
      }
    }
    console.log(`部署${env}环境应用${app}完成`)
  }
}
