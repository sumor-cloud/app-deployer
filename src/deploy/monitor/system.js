import SSH from '../../ssh/index.js'

export default async (server) => {
  const ssh = new SSH(server)
  const system = await ssh.monitor.system()
  await ssh.disconnect()

  return system
}
