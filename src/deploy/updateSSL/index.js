import copySSL from './copySSL.js'
import parseServerDomain from './parseServerDomain.js'

export default async (config) => {
  const servers = parseServerDomain(config)
  for (const server in servers) {
    const { info, domains } = servers[server]
    for (const domain of domains) {
      console.log(`更新${domain}域名证书到${server}服务器`)
      await copySSL(info, domain)
    }
  }
}
