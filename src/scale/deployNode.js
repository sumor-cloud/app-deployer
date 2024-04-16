import fse from 'fs-extra'
import SSH from '../ssh/index.js'
import clone from '../version/setup/index.js'
import buildNodeJS from '../version/build/buildNodeJS.js'
import buildImage from '../version/build/buildImage.js'
import checkImageExists from '../version/build/checkImageExists.js'

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
  const port = await ssh.port.getPort()

  const instanceInfo = {
    app,
    env,
    version: version.name,
    server: server.name,
    port,
    upTime: Date.now(),
    versionTime: version.committerDate
  }
  const remoteEnv = `/usr/sumor-cloud/env/${app}_${env}`
  await ssh.file.putFolder(deployPath, remoteEnv)
  await fse.remove(deployPath)

  const remoteInstance = `/usr/sumor-cloud/instance/${app}_${env}/${Date.now()}.json`
  await ssh.file.writeFile(remoteInstance, JSON.stringify(instanceInfo, null, 4))

  const dockerId = `sumor_app_${app}_${env}_${version.name}_${port}`
  console.log(`正在部署实例到容器${dockerId}`)
  await ssh.docker.execCommand(`docker run -itd --restart=on-failure -v ${remoteInstance}:/usr/source/instance.json:ro -v ${remoteEnv}:/usr/source/config:ro -v /usr/sumor-cloud/ssl/${domain}:/usr/source/ssl:ro -p ${port}:443 --name ${dockerId} -d ${app}:${version.name}`)

  await ssh.disconnect()

  return dockerId
}
