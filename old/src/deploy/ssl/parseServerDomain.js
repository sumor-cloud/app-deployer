export default config => {
  const servers = {}
  for (const env in config.env) {
    for (const app in config.env[env]) {
      const { domain, entry } = config.env[env][app]

      servers[entry] = servers[entry] || {
        info: config.server[entry],
        domains: []
      }

      const existsDomain = servers[entry].domains.find(item => item === domain)
      if (!existsDomain) {
        servers[entry].domains.push(domain)
      }
    }
  }
  return servers
}
