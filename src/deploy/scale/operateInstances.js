class InstanceOperator {
  constructor(config, instances) {
    this.config = config
    this.instances = instances
  }

  invalidVersion(env, app) {
    const envScale = this.config.scale[env] || {}
    const appScale = envScale[app] || {}
    const result = {}
    const existsVersions = Object.keys(appScale)
    for (const server in this.config.server) {
      const serverOutOfVersionInstances = this.instances[server].filter((o) => {
        const param = o.split('_')
        const version = param[4]
        return o.indexOf(`sumor_app_${app}_${env}`) === 0 && existsVersions.indexOf(version) < 0
      })
      if (serverOutOfVersionInstances.length > 0) {
        result[server] = serverOutOfVersionInstances
      }
    }
    return result
  }

  remove(server, instances) {
    this.instances[server] = this.instances[server].filter((o) => instances.indexOf(o) < 0)
  }

  current(server, env, app, version) {
    return this.instances[server].filter(
      (o) => o.indexOf(`sumor_app_${app}_${env}_${version}`) === 0
    )
  }
}
export default InstanceOperator
