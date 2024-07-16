import loadVersions from './load/loadVersions.js'
import loadInstances from './load/loadInstances.js'
import convertScaleVersion from './calc/convertScaleVersion.js'
import calcInstanceDiff from './calc/calcInstanceDiff.js'
import calcUpdatedSite from './calc/calcUpdatedSite.js'

import createInstance from './scale/createInstance.js'
import removeInstances from './scale/removeInstances.js'
import applySite from './scale/applySite.js'

export default async config => {
  const versions = await loadVersions(config)
  const instances = await loadInstances(config)

  const scale = convertScaleVersion(versions, config.scale)
  calcInstanceDiff(instances, scale)

  // add instance
  for (const env in scale) {
    for (const app in scale[env]) {
      for (const versionId in scale[env][app]) {
        const { add } = scale[env][app][versionId]
        for (const server in add) {
          const count = add[server]
          for (let i = 0; i < count; i++) {
            await createInstance(config, {
              app,
              env,
              version: versionId,
              server
            })
          }
        }
      }
    }
  }

  // update site
  const updatedInstances = await loadInstances(config)
  const sites = calcUpdatedSite(config, scale, updatedInstances)
  for (const server in sites) {
    const site = sites[server]
    await applySite(config, server, site)
  }

  // remove instance
  for (const env in scale) {
    for (const app in scale[env]) {
      for (const versionId in scale[env][app]) {
        const { remove } = scale[env][app][versionId]
        for (const server in remove) {
          await removeInstances(config, server, remove[server])
        }
      }
    }
  }
  console.log(scale)
}
