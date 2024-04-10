export default async (ssh, {
  app, env, deploy, version, server, port, https, domain
}) => {
  const remote = `/usr/sumor/apps/${env}/${version}`
  const data = `/usr/sumor/data/${env}`
  const logPath = `/tmp/sumor/log/${env}/${version}`

  await ssh.file.ensureDir(data)
  const dockerId = `sumor_app_${env}_${version}_${port}`
  await ssh.docker.delete(dockerId)
  await ssh.docker.run({
    image: 'node',
    name: dockerId,
    folder: [
      { from: `/usr/sumor/ssl/${domain}`, to: '/usr/sumor/ssl', readOnly: true },
      { from: remote, to: '/usr/sumor/source', readOnly: true },
      { from: data, to: '/usr/sumor/data' },
      { from: logPath, to: '/tmp/log' }
    ],
    port: [{ from: port, to: https ? 443 : 80 }]
  })
  const instanceInfo = {
    app,
    deploy,
    version,
    server,
    port,
    time: Date.now()
  }
  await ssh.docker.exec(dockerId, 'cp -r /usr/sumor/source /usr/sumor/runtime')
  await ssh.docker.exec(dockerId, 'ln -s /usr/sumor/data /usr/sumor/runtime/data')
  await ssh.docker.exec(dockerId, 'ln -s /usr/sumor/ssl /usr/sumor/runtime/ssl')
  await ssh.docker.exec(dockerId, `echo '${JSON.stringify(instanceInfo)}' > /usr/sumor/runtime/instance.json`)
  await ssh.docker.exec(dockerId, `cd /usr/sumor/runtime;node serve.js > /tmp/log/${port}.log 2>&1;`, { background: true })

  return await ssh.docker.ip(dockerId)
}
