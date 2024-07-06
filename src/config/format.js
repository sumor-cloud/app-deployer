const live = config => {
  const live = []
  for (const env in config.env) {
    const envInfo = config.env[env]

    for (const app in envInfo) {
      const { domain, entry } = envInfo[app]
      const envScale = config.scale[env] || {}
      const appScale = envScale[app] || {}

      let liveVersion = null
      for (const version in appScale) {
        const versionScale = appScale[version] || {}
        if (versionScale.live) {
          liveVersion = version
        }
      }
      const instance = {}
      for (const version in appScale) {
        const versionScale = appScale[version] || {}
        for (const server in versionScale.instance) {
          instance[version] = instance[version] || {}
          instance[version][server] = versionScale.instance[server]
        }
      }
      live.push({
        env,
        app,
        domain,
        entry,
        version: liveVersion,
        instance
      })
    }
  }

  return live
}

export default config => {
  const result = { ...config }

  result.live = live(config)

  return result
}
