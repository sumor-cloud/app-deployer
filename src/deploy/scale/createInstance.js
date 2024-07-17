import packVersion from '../../pack/packVersion.js'
import getTmpDir from '../../utils/getTmpDir.js'
import unzip from '../../utils/unzip.js'
import SSH from '../../utils/SSH.js'
import fse from 'fs-extra'

import logger from '../../utils/Logger.js'

export default async (config, { app, env, version, server }) => {
  const root = config.root || process.cwd()
  const remoteVersionPath = `/usr/sumor-cloud/version/${app}/${version}`

  const ssh = new SSH(config.server[server])
  await ssh.connect()

  // build docker code
  if (!(await ssh.file.exists(remoteVersionPath))) {
    logger.code('DEPLOY_ADD_SHIP_CODE', { app, server })
    const tmpPath = await getTmpDir()

    // pack code
    const targetZip = `${root}/versions/${app}/${version}.zip`
    if (!(await fse.exists(targetZip))) {
      logger.code('DEPLOY_ADD_PACK_CODE', { app, server })
      const git = config.source[app]
      await packVersion(git, version, targetZip)
      logger.code('DEPLOY_ADD_PACK_CODE_FINISHED', { app })
    }

    // shipping code to server
    await unzip(targetZip, tmpPath)
    await ssh.file.ensureDir(remoteVersionPath)
    await ssh.file.putFolder(tmpPath, remoteVersionPath)
    await fse.remove(tmpPath)
    logger.code('DEPLOY_ADD_SHIP_CODE_FINISHED', { app, path: remoteVersionPath })

    logger.code('DEPLOY_ADD_BUILD_CODE', { app, server })
    const startTime = Date.now()
    const logs = await ssh.docker.buildNode(remoteVersionPath)
    logger.trace(logs)
    logger.code('DEPLOY_ADD_BUILD_CODE_FINISHED', { app, time: Date.now() - startTime })
  }

  const port = await ssh.port.getPort()

  // prepare runtime
  const remoteRuntimePath = `/usr/sumor-cloud/runtime/${env}/${app}/${port}`
  await ssh.file.remove(remoteRuntimePath)
  await ssh.file.ensureDir(remoteRuntimePath)
  // await ssh.file.copy(remoteVersionPath, remoteRuntimePath)
  await ssh.exec(`cp -r ${remoteVersionPath}/* ${remoteRuntimePath}`)
  const localConfigPath = `${root}/assets/${app}/${env}`
  const remoteRuntimeConfigPath = `${remoteRuntimePath}/config`
  await ssh.file.ensureDir(remoteRuntimeConfigPath)
  await ssh.file.putFolder(localConfigPath, remoteRuntimeConfigPath)
  const domain = config.env[env][app].domain
  const localSSLPath = `${root}/assets/ssl/${domain}`
  const remoteRuntimeSSLPath = `${remoteRuntimePath}/ssl`
  await ssh.file.ensureDir(remoteRuntimeSSLPath)
  if (await fse.exists(localSSLPath)) {
    await ssh.file.putFolder(localSSLPath, remoteRuntimeSSLPath)
  }

  const shortId = version.substring(0, 7)
  const dockerId = `sumor_app_${app}_${env}_${shortId}_${port}`
  const startTime = Date.now()
  await ssh.docker.runNode(dockerId, remoteRuntimePath, { port })
  logger.code('DEPLOY_ADD_START_INSTANCE', { name: dockerId, server, time: Date.now() - startTime })

  await ssh.disconnect()

  return dockerId
}
