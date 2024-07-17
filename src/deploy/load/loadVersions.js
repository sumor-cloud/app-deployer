import updateVersions from '../../pack/updateVersions.js'
export default async config => {
  const result = {}
  for (const app in config.source) {
    const versions = await updateVersions(config, app)
    result[app] = versions
  }
  return result
}
