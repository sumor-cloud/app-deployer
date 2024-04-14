import SSH from '../../ssh/index.js'

export default async (server, id) => {
  const ssh = SSH(server)
  await ssh.docker.delete(id)
  await ssh.disconnect()
}
