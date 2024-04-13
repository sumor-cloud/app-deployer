import SSH from '../ssh/index.js'

export default async (server, domain) => {
  const localPath = `${process.cwd()}/assets/ssl/${domain}`
  const remotePath = `/usr/sumor-cloud/ssl/${domain}`
  const ssh = SSH(server)
  await ssh.file.putFolder(localPath, remotePath)
  await ssh.disconnect()
}
