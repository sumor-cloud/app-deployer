import loadVersions from './load/loadVersions.js'
import loadInstances from './load/loadInstances.js'
import convertScaleVersion from './calc/convertScaleVersion.js'
import calcInstanceDiff from './calc/calcInstanceDiff.js'
import calcUpdatedSite from './calc/calcUpdatedSite.js'

import updateVersions from '../pack/updateVersions.js'
import createInstance from './scale/createInstance.js'
import removeInstances from './scale/removeInstances.js'
import applySite from './scale/applySite.js'
import logger from '../utils/Logger.js'

export default async config => {
  logger.code('DEPLOY_STARTED')
  const versions = await loadVersions(config)
  const instances = await loadInstances(config)

  const scale = convertScaleVersion(versions, config.scale)
  calcInstanceDiff(instances, scale)

  // add instance
  logger.code('DEPLOY_ADD_INSTANCE')
  for (const env in scale) {
    for (const app in scale[env]) {
      const versions = await updateVersions(config, app)
      const getVersion = versionId => {
        for (const version in versions) {
          if (versions[version].id === versionId) {
            return versions[version]
          }
        }
      }
      for (const versionId in scale[env][app]) {
        const { name: versionName, authorDate: versionTime } = getVersion(versionId)
        const { add, instance } = scale[env][app][versionId]
        for (const server in add) {
          const target = instance[server]
          const diff = add[server]
          logger.code('DEPLOY_ADD_INSTANCE_SUMMARY', {
            app,
            env,
            version: versionName,
            server,
            current: target - diff,
            target
          })
          for (let i = 0; i < diff; i++) {
            await createInstance(config, {
              app,
              env,
              version: versionId,
              server,
              versionName,
              versionTime
            })
          }
        }
      }
    }
  }
  logger.code('DEPLOY_ADD_INSTANCE_FINISHED')

  // update site
  logger.code('DEPLOY_UPDATE_SITE')
  const updatedInstances = await loadInstances(config)
  const sites = calcUpdatedSite(config, scale, updatedInstances)
  for (const server in sites) {
    const site = sites[server]
    logger.code('DEPLOY_UPDATE_SITE_SUMMARY', { server })
    await applySite(config, server, site)
  }
  logger.code('DEPLOY_UPDATE_SITE_FINISHED')

  // remove instance
  logger.code('DEPLOY_REMOVE_INSTANCE')
  for (const env in scale) {
    for (const app in scale[env]) {
      for (const versionId in scale[env][app]) {
        const { versions, remove, instance } = scale[env][app][versionId]
        for (const server in remove) {
          const target = instance[server]
          const diff = remove[server].length
          const versionString = versions.join(', ')
          logger.code('DEPLOY_REMOVE_INSTANCE_SUMMARY', {
            app,
            env,
            version: versionString,
            server,
            current: target + diff,
            target
          })

          await removeInstances(config, server, remove[server])
        }
      }
    }
  }
  logger.code('DEPLOY_REMOVE_INSTANCE_FINISHED')

  logger.code('DEPLOY_FINISHED')
}
