export default async (ssh, options) => {
  const {
    app,
    version,
    env,
    localConfig,
    remoteConfig,
    domain
  } = options || {}

  const port = await ssh.port.getPort()
  const dockerId = `sumor_app_${app}_${env}_${version}_${port}`

  await ssh.file.putFolder(localConfig, remoteConfig)

  const runConfig = [
    'docker run -itd --restart=on-failure',
        `-v ${remoteConfig}:/usr/source/config:ro`
  ]
  if (domain) {
    runConfig.push(`-v /usr/sumor-cloud/ssl/${domain}:/usr/source/ssl:ro`)
  }
  runConfig.push(`-p ${port}:443`)
  runConfig.push(`--name ${dockerId}`)
  runConfig.push(`-d ${app}:${version}`)
  await ssh.docker.execCommand(runConfig.join(' '))

  return dockerId
}
