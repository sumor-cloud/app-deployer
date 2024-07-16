import packVersion from '../../pack/packVersion.js'
import getTmpDir from '../../utils/getTmpDir.js'
import unzip from '../../utils/unzip.js'
import SSH from '../../utils/SSH.js'

export default async (config, { app, env, version, server }) => {
  const root = config.root || process.cwd()
  const git = config.source[app]
  const targetZip = `${root}/versions/${app}/${version}.zip`
  await packVersion(git, version, targetZip)
  const zipPath = `${config.root}/versions/${app}/${version}.zip`
  const tmpPath = await getTmpDir()
  await unzip(zipPath, tmpPath)

  const remotePath = `/usr/sumor-cloud/version/${app}/${version}`

  const ssh = new SSH(config.server[server])
  await ssh.connect()

  // build docker code
  if (!(await ssh.file.exists(remotePath))) {
    await ssh.file.ensureDir(remotePath)
    await ssh.file.putFolder(tmpPath, remotePath)
    await ssh.docker.buildNode(remotePath)
  }

  const port = await ssh.port.getPort()
  const shortId = version.substring(0, 7)
  const dockerId = `sumor_app_${app}_${env}_${shortId}_${port}`
  await ssh.docker.runNode(dockerId, remotePath, { port })

  await ssh.disconnect()

  return dockerId
}
