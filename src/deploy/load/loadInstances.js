import SSH from '../../utils/SSH.js'

export default async config => {
  const result = {}
  for (const server in config.server) {
    const ssh = new SSH(config.server[server])
    await ssh.connect()

    const serverInstances = await ssh.docker.containers()
    result[server] = serverInstances.filter(obj => obj.instanceId.indexOf('sumor_app') === 0)

    await ssh.disconnect()
  }
  return result
}
