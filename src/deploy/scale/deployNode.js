import fse from 'fs-extra'
import SSH from '../../ssh/index.js'
import clone from './version/setup/index.js'
import buildNodeJS from './version/build/buildNodeJS.js'
import buildImage from './version/build/buildImage.js'
import checkImageExists from './version/build/checkImageExists.js'
import scaleNodeJSInstance from './scaleNodeJSInstance.js'

export default async ({
  server, app, env, git, version, domain
}) => {
  const ssh = new SSH(server)

  const existsImage = await checkImageExists(ssh, app, version.name)
  if (!existsImage) {
    console.log('开始构建代码')
    const buildPath = `${process.cwd()}/tmp/build/${app}/${version.name}`
    if (!await fse.exists(buildPath)) {
      console.log(`正在构建源代码到${buildPath}`)
      await fse.ensureDir(`${process.cwd()}/tmp/build`)
      await clone(buildPath, git, version.id)
      await buildNodeJS(buildPath)
    }
    console.log('代码构建完成')
    console.log(`正在构建版本${version.name}镜像`)
    await buildImage(ssh, { app, version: version.name, source: buildPath })
    console.log('构建版本镜像完成')
  }

  console.log('部署容器实例')
  const deployPath = `${process.cwd()}/tmp/env/${app}/${env}`
  console.log(`正在配置环境相关代码到${deployPath}`)
  const envPath = `${process.cwd()}/assets/${app}/${env}`
  if (await fse.exists(envPath)) {
    await fse.copy(envPath, deployPath)
  }

  const dockerId = await scaleNodeJSInstance(ssh, {
    app,
    version: version.name,
    versionTime: version.committerDate,
    env,
    localConfig: deployPath,
    remoteConfig: `/usr/sumor-cloud/env/${app}_${env}`,
    domain,
    server: server.name
  })
  console.log(`已部署新实例${dockerId}`)
  await ssh.disconnect()

  return dockerId
}
