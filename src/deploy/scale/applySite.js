import SSH from '../../utils/SSH.js'

export default async (config, server, site) => {
  const ssh = new SSH(config.server[server])
  await ssh.connect()

  const root = config.root || process.cwd()
  site.ssl = `${root}/ssl`
  await ssh.docker.runSite(site)

  await ssh.disconnect()
}
