export default async (ssh, { env, version, logger }) => {
  const remote = `/usr/sumor/apps/${env}/${version}`
  const data = `/usr/sumor/data/${env}`
  const logPath = `/tmp/sumor/log/${env}/${version}`

  await ssh.file.ensureDir(data)
  const dockerId = `sumor_setup_${env}_${version}`
  await ssh.docker.delete(dockerId)
  await ssh.docker.run({
    image: 'node',
    name: dockerId,
    folder: [
      { from: '/usr/sumor/ssl', to: '/usr/sumor/ssl', readOnly: true },
      { from: remote, to: '/usr/sumor/source', readOnly: true },
      { from: data, to: '/usr/sumor/data' },
      { from: logPath, to: '/tmp/log' }
    ]
  })
  await ssh.docker.exec(dockerId, 'cp -r /usr/sumor/source /usr/sumor/runtime')
  await ssh.docker.exec(dockerId, 'ln -s /usr/sumor/data /usr/sumor/runtime/data')
  await ssh.docker.exec(dockerId, 'ln -s /usr/sumor/ssl /usr/sumor/runtime/ssl')
  const log = await ssh.docker.exec(dockerId, 'cd /usr/sumor/runtime;node index.js')
  await ssh.file.writeFile(`${logPath}/setup.log`, log)
  await ssh.docker.delete(dockerId)
}
