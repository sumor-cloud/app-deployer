import updateRoute from '../../../route/index.js'
import removeInstance from '../removeInstance.js'

export default async (config, keep, server, cut) => {
  await updateRoute(config, keep)
  for (const id of cut) {
    console.log(`清除实例${id}`)
    await removeInstance(config.server[server], id)
  }
}
