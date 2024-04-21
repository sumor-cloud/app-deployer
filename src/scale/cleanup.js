import updateRoute from '../route/index.js'
import SSH from '../ssh/index.js'

export default async (config, keep, server, cut) => {
  await updateRoute(config, keep)
  for (const id of cut) {
    console.log(`清除实例${id}`)
    const ssh = new SSH(config.server[server])
    await ssh.docker.remove(id)
    await ssh.disconnect()
  }
}
