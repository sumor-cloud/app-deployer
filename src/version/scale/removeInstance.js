import SSH from '../../ssh/index.js'

export default async (server, id) => {
  const ssh = new SSH(server)
  await ssh.docker.delete(id)
  await ssh.disconnect()
}
