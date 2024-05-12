import copySSL from './copySSL.js'
import parseServerDomain from './parseServerDomain.js'

export default async (config) => {
  const servers = parseServerDomain(config)
  for (const server in servers) {
    const { info, domains } = servers[server]
    for (const domain of domains) {
      await copySSL(info, domain)
    }
  }
}
