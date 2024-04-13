import SSH from '../ssh/index.js'

export default async (scope) => {
  const instances = {}
  for (const server in scope.server) {
    const ssh = SSH(scope.server[server])
    let serverInstances = await ssh.docker.instances()
    // serverInstances = serverInstances.sort((x, y) => x.instanceId > y.instanceId ? 1 : -1);
    serverInstances = serverInstances.filter((obj) => obj.instanceId.indexOf('sumor_app') === 0)
    instances[server] = serverInstances.map((o) => o.instanceId)
    await ssh.disconnect()
  }
  return instances
}
