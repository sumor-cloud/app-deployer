import fse from 'fs-extra'
import updateVersion from './updateVersion.js'
import loadInstances from './loadInstances.js'
import deployNode from './deployNode.js'
import updateSite from './updateSite.js'
import removeInstance from './removeInstance.js'
import copySSL from './copySSL.js'
import monitorSystem from '../monitor/system.js'
import SSH from '../../ssh/index.js'

export default async (scope, scale) => {
  try {
    const startTime = Date.now()
    console.log('正在启动部署')

    // 补全数据
    for (const i in scope.server) {
      scope.server[i].name = i
    }

    // 更新证书
    console.log('\n\n ==================== 更新证书 ==================== \n')
    for (const env in scope.env) {
      for (const app in scope.env[env]) {
        const { domain, entry } = scope.env[env][app]
        const sslPath = `${process.cwd()}/assets/ssl/${domain}`
        if (sslPath && scope.server[entry]) {
          console.log(`更新${domain}域名证书到${entry}服务器`)
          await copySSL(scope.server[entry], domain, sslPath)
        }
      }
    }

    // 检查应用版本
    console.log('\n\n ==================== 检查应用版本 ==================== \n')
    const versions = {}
    for (const app in scope.source) {
      console.log(`应用${app}正在检查应用版本`)
      versions[app] = await updateVersion(app, scope.source[app])
      console.log('应用版本列表')
      for (const version in versions[app]) {
        console.log(`- ${version}${versions[app][version].beta ? ' 测试版' : ''}`)
      }
      console.log(`应用${app}检查应用版本完成`)
    }

    // 获取服务器运行状态
    console.log('\n\n ==================== 获取服务器运行状态 ==================== \n')
    for (const server in scope.server) {
      const system = await monitorSystem(scope.server[server])
      console.log(`服务器${server}运行状态`)
      console.log(system)
    }

    // 获取服务器实例状态
    console.log('\n\n ==================== 获取服务器实例状态 ==================== \n')
    const instances = await loadInstances(scope)
    for (const server in instances) {
      console.log(`服务器${server}现存实例列表`)
      for (const i in instances[server]) {
        console.log(`- ${instances[server][i]}`)
      }
    }

    // 部署应用
    console.log('\n\n ==================== 部署应用 ==================== \n')
    const buildGenerated = {}
    const imageGenerated = {}
    await fse.remove(`${process.cwd()}/tmp/env`)
    for (const env in scope.env) {
      const envInfo = scope.env[env]
      for (const app in envInfo) {
        const { domain } = envInfo[app]
        const envScale = scale[env] || {}
        const appScale = envScale[app] || {}
        let liveVersion
        for (const version in appScale) {
          const versionScale = appScale[version] || {}
          if (versionScale.live) {
            liveVersion = version
          }
        }

        const existsVersions = Object.keys(appScale)
        for (const server in scope.server) {
          const serverOutOfVersionInstances = instances[server].filter((o) => {
            const param = o.split('_')
            const version = param[4]
            return o.indexOf(`sumor_app_${app}_${env}`) === 0 && existsVersions.indexOf(version) < 0
          })
          if (serverOutOfVersionInstances.length > 0) {
            console.log(`正在清除${env}环境应用${app}在服务器${server}中的过期实例`)
            instances[server] = instances[server].filter((o) => serverOutOfVersionInstances.indexOf(o) < 0)
            await updateSite(scope, scale, instances)
            for (const id of serverOutOfVersionInstances) {
              console.log(`清除实例${id}`)
              await removeInstance(scope.server[server], id)
            }
          }
        }

        console.log(`正在部署${env}环境应用${app}，上线版本：${liveVersion || '无'}`)
        for (const version in appScale) {
          const versionScale = appScale[version] || {}
          for (const server in versionScale.instance) {
            const targetSize = versionScale.instance[server]
            console.log(`计划部署${version}版本${targetSize}个实例到${server}服务器`)
            const serverInstances = instances[server].filter((o) => o.indexOf(`sumor_app_${app}_${env}_${version}`) === 0)
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
                  const ssh = SSH(scope.server[server])
                  await ssh.docker.deleteImage(app, version)
                  await ssh.disconnect()
                  imageGenerated[`${app}|${version}|${server}`] = true
                }
                const dockerId = await deployNode({
                  server: scope.server[server],
                  app,
                  env,
                  git: scope.source[app],
                  version: versionInfo,
                  domain
                })
                instances[server].unshift(dockerId)
                await updateSite(scope, scale, instances)
              }
              console.log(`扩容${diffSize}个完成`)
            } else if (currentSize > targetSize) {
              const diffSize = currentSize - targetSize
              console.log(`当前实例个数：${currentSize}，需要缩减${diffSize}个`)
              const cutInstances = serverInstances.slice(targetSize, currentSize)
              instances[server] = instances[server].filter((o) => cutInstances.indexOf(o) < 0)
              await updateSite(scope, scale, instances)
              for (const id of cutInstances) {
                await removeInstance(scope.server[server], id)
              }
              console.log(`缩减${diffSize}个完成`)
            } else {
              console.log('实例数量已符合计划，无需修改')
            }
          }
        }
        console.log(`部署${env}环境应用${app}完成`)
      }
    }

    console.log('\n\n ==================== 实例情况 ==================== \n')
    console.log(instances)
    await updateSite(scope, scale, instances)

    console.log(`所有应用已完成部署 ${Date.now() - startTime}ms`)
  } catch (e) {
    console.log(e)
  }
}