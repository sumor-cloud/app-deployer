import clone from './setup/index.js'
import fse from 'fs-extra'
import getBranchVersions from './version/getBranchVersions.js'
import getTmpDir from '../utils/getTmpDir.js'

export default async (root, git, app) => {
  const versionsPath = root + '/versions'

  const cache = {
    time: Date.now(),
    versions: {}
  }
  let versions
  if (await fse.exists(`${versionsPath}/${app}/cache.json`)) {
    const cache = await fse.readJson(`${versionsPath}/${app}/cache.json`)
    if (cache.time + 60 * 1000 > Date.now()) {
      versions = cache.versions
    }
  }
  if (!versions) {
    const tmpPath = await getTmpDir()
    try {
      await clone(git, tmpPath)
      versions = await getBranchVersions(tmpPath)
      cache.time = Date.now()
      cache.versions = versions
      await fse.ensureDir(`${versionsPath}/${app}`)
      await fse.writeJson(`${versionsPath}/${app}/cache.json`, cache)
    } finally {
      await fse.remove(tmpPath)
    }
  }

  return versions
}
