export default (existingInstance, scale) => {
  // sort existingInstance and target by createdTime ASC
  for (const server in existingInstance) {
    existingInstance[server].sort((a, b) => a.createdTime - b.createdTime)
  }

  for (const env in scale) {
    for (const app in scale[env]) {
      for (const versionId in scale[env][app]) {
        const shortId = versionId.substring(0, 7)
        scale[env][app][versionId].add = {}
        scale[env][app][versionId].remove = {}
        const { instance, add, remove } = scale[env][app][versionId]
        for (const server in instance) {
          const count = instance[server]
          const matchedInstance = existingInstance[server].filter(i =>
            i.instanceId.startsWith(`sumor_app_${app}_${env}_${shortId}`)
          )
          if (matchedInstance.length < count) {
            // create new instance
            const diff = count - matchedInstance.length
            add[server] = diff
          } else if (matchedInstance.length > count) {
            // remove instance
            remove[server] = []
            const diff = matchedInstance.length - count
            for (let i = 0; i < diff; i++) {
              remove[server].push(matchedInstance[i].instanceId)
            }
          }
        }
      }
    }
  }

  return scale
}
