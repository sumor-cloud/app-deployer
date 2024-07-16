import SSH from '../../utils/SSH.js'
export default async (config, server, instances) => {
  const ssh = new SSH(config.server[server])
  await ssh.connect()
  for (const instance of instances) {
    await ssh.docker.remove(instance)
  }
  await ssh.disconnect()
}
