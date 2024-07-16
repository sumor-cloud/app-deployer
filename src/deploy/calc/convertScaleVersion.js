export default (versions, scale) => {
  const result = {}
  for (const env in scale) {
    result[env] = {}
    for (const app in scale[env]) {
      result[env][app] = {}
      for (const version in scale[env][app]) {
        if (versions[app] && versions[app][version]) {
          const versionId = versions[app][version].id
          result[env][app][versionId] = result[env][app][versionId] || {}
          const oldVersion = scale[env][app][version]
          const newVersion = result[env][app][versionId]
          newVersion.versions = newVersion.versions || []
          if (oldVersion.live) {
            newVersion.live = true

            // clean up live flag in other versions
            for (const v in result[env][app]) {
              if (v !== versionId) {
                result[env][app][v].live = false
              }
            }
          } else {
            newVersion.live = false
          }
          newVersion.versions.push(version)

          // merge instance, use last one
          newVersion.instance = oldVersion.instance || {}
        }
      }
    }
  }

  return result
}
