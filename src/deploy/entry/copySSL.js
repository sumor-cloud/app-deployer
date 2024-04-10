import SSH from '../../ssh/index.js'

export default async (server, domain, path) => {
  const ssh = SSH(server)
  await ssh.file.putFolder(path, `/usr/sumor-cloud/ssl/${domain}`)
  await ssh.disconnect()
}
