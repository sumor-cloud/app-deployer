export default async (ssh, options) => {
  const {
    app,
    version,
    versionTime,
    env,
    localConfig,
    remoteConfig,
    domain,
    server
  } = options || {}

  const port = await ssh.port.getPort()
  const dockerId = `sumor_app_${app}_${env}_${version}_${port}`

  await ssh.file.putFolder(localConfig, remoteConfig)

  const remoteInstance = `/usr/sumor-cloud/instance/${app}_${env}/${Date.now()}.json`
  const instanceInfo = {
    app,
    env,
    version,
    server,
    port,
    upTime: Date.now(),
    versionTime
  }
  await ssh.file.writeFile(remoteInstance, JSON.stringify(instanceInfo, null, 4))

  const runConfig = [
    'docker run -itd --restart=on-failure',
        `-v ${remoteConfig}:/usr/source/config:ro`
  ]
  if (domain) {
    runConfig.push(`-v /usr/sumor-cloud/ssl/${domain}:/usr/source/ssl:ro`)
  }
  if (remoteInstance) {
    runConfig.push(` -v ${remoteInstance}:/usr/source/instance.json:ro`)
  }
  runConfig.push(`-p ${port}:443`)
  runConfig.push(`--name ${dockerId}`)
  runConfig.push(`-d ${app}:${version}`)
  await ssh.docker.cmd(runConfig.join(' '), {
    cwd: '/'
  })

  return dockerId
}
