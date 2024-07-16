import updateVersions from '../../pack/updateVersions.js'
export default async config => {
  const root = config.root || process.cwd()
  const result = {}
  for (const app in config.source) {
    const git = config.source[app]
    const versions = await updateVersions(root, git, app)
    result[app] = versions
  }
  return result
}
