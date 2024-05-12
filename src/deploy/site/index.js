import generateConfig from './generateConfig/index.js'
import parseInstancesToPorts from './utils/parseInstancesToPorts.js'
import deployNginx from './deployNginx/index.js'

export default async (config, instances) => {
  const site = {}
  for (const envApp of config.live) {
    const { env, app, domain, entry, version: liveVersion } = envApp

    site[entry] = site[entry] || {}
    site[entry][domain] = []

    for (const server in instances) {
      const serverInfo = config.server[server]
      const ports = parseInstancesToPorts(instances[server], app, env, liveVersion)
      for (const port of ports) {
        site[entry][domain].push(`${serverInfo.iHost || serverInfo.host}:${port}`)
      }
    }
  }
  for (const server in site) {
    const apps = []
    for (const domain in site[server]) {
      const app = {
        domain,
        instances: site[server][domain].map((url) => ({
          url
        }))
      }
      apps.push(app)
    }

    const nginxConfig = generateConfig(apps)

    await deployNginx(config.server[server], nginxConfig)
  }
}
