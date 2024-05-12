import updateSite from '../site/index.js'
import SSH from '../../utils/ssh/index.js'

export default async (config, keep, server, cut) => {
  await updateSite(config, keep)
  for (const id of cut) {
    console.log(`清除实例${id}`)
    const ssh = new SSH(config.server[server])
    await ssh.docker.remove(id)
    await ssh.disconnect()
  }
}
