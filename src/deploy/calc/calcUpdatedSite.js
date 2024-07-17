export default (config, scale, instances) => {
  const sites = {}
  for (const env in config.env) {
    for (const app in config.env[env]) {
      const { domain, entry } = config.env[env][app]
      sites[entry] = sites[entry] || []

      for (const versionId in scale[env][app]) {
        const shortId = versionId.substring(0, 7)
        const version = scale[env][app][versionId]
        if (version.live) {
          const remove = version.remove || {}
          const routes = []
          for (const server in instances) {
            const matchedInstances = instances[server].filter(instance => {
              const matched = instance.instanceId.startsWith(`sumor_app_${app}_${env}_${shortId}`)
              const notInRemove = !remove[server] || !remove[server].includes(instance.instanceId)
              return matched && notInRemove
            })
            const host = config.server[server].iHost || config.server[server].host
            for (const instance of matchedInstances) {
              const port = parseInt(instance.instanceId.split('_').pop())
              routes.push({
                host,
                port
              })
            }
          }
          sites[entry].push({
            domain,
            servers: routes
          })
        }
      }
    }
  }

  const results = {}
  for (const entry in sites) {
    results[entry] = {
      workerProcesses: 1,
      workerConnections: 1024,
      port: 443,
      domains: sites[entry]
    }
  }
  return results
}
