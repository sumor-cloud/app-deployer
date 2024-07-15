import clone from './setup/index.js'
import os from 'os'
import fse from 'fs-extra'
import archiver from 'archiver'
import getBranchVersions from './version/getBranchVersions.js'

const getTmpDir = async () => {
  const path = `${os.tmpdir()}/sumor-deploy/${Date.now()}`
  await fse.ensureDir(path)
  return path
}

const zip = (source, target, ignore) => {
  return new Promise((resolve, reject) => {
    const output = fse.createWriteStream(target)
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    })
    // listen for all archive data to be written
    output.on('close', () => {
      resolve()
    })
    archive.pipe(output)
    archive.glob('**', {
      cwd: source,
      dot: true,
      // root:sourceFolder
      ignore: ignore || [] // ["*.git*"]
    })
    archive.finalize()
  })
}

export default async (config, app, version) => {
  const root = config.root || process.cwd()
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
      await clone(config.source[app], tmpPath)
      versions = await getBranchVersions(tmpPath)
      cache.time = Date.now()
      cache.versions = versions
      await fse.ensureDir(`${versionsPath}/${app}`)
      await fse.writeJson(`${versionsPath}/${app}/cache.json`, cache)
    } catch (e) {
      await fse.remove(tmpPath)
      throw e
    }
    await fse.remove(tmpPath)
  }

  const versionInfo = versions[version]
  if (versionInfo) {
    const versionPath = `${versionsPath}/${app}/${versionInfo.id}.zip`
    const existsVersionFile = await fse.exists(versionPath)
    if (!existsVersionFile) {
      const tmpPath = await getTmpDir()
      try {
        await clone(config.source[app], tmpPath)
        await zip(tmpPath, versionPath, ['.git/**', '*.git*'])
      } catch (e) {
        await fse.remove(tmpPath)
        throw e
      }
      await fse.remove(tmpPath)
    }
  }
}
