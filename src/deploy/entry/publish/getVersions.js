import setup from './git/setup.js'
import getVersions from './git/versions.js'
import getPublishedVersion from './getPublishedVersion.js'

export default async (info) => {
  const rootPath = `${process.cwd()}/tmp/publish/${info.id}`

  await setup(rootPath, info.repository.authedUrl)

  const versions = await getVersions(rootPath)

  const publishedVersion = await getPublishedVersion(info.id)
  for (const i in versions) {
    versions[i].gitUrl = `${info.repository.url}/commit/${versions[i].id}`
    versions[i].registryStatus = 0
    if (publishedVersion.data[i]) {
      if (publishedVersion.data[i] !== versions[i].id) {
        versions[i].registryStatus = 1
      } else {
        versions[i].registryStatus = 2
      }
      versions[i].registryUrl = `${info.registry.url}/-/web/detail/${info.registry.scope}/${info.name}/v/${versions[i].name}`
    }
  }

  return versions
}
