import updateVersions from './updateVersions.js'
import packVersion from './packVersion.js'

export default async (config, app, version) => {
  const root = config.root || process.cwd()
  const versionsPath = root + '/versions'

  const versions = await updateVersions(config, app)

  const versionInfo = versions[version]
  if (versionInfo) {
    const versionId = versionInfo.id
    const git = config.source[app]
    const versionPath = `${versionsPath}/${app}/${versionId}.zip`
    await packVersion(git, versionId, versionPath)
  }

  return versionInfo.id
}
