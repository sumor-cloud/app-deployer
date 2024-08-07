import SSH from '../../SSH.js'

export default async servers => {
  const instances = {}
  for (const server in servers) {
    const ssh = new SSH(servers[server])
    let serverInstances = await ssh.docker.containers()
    serverInstances = serverInstances.filter(obj => obj.instanceId.indexOf('sumor_app') === 0)
    instances[server] = serverInstances.map(o => o.instanceId)
    await ssh.disconnect()
  }
  return instances
}
