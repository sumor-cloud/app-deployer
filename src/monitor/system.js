import SSH from '../utils/SSH.js'

export default async server => {
  const ssh = new SSH(server)
  await ssh.connect()
  const system = await ssh.monitor.system()
  await ssh.disconnect()

  return system
}
