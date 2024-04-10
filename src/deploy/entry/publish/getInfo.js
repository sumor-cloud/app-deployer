export default async (id, { db }) => {
  const result = {}
  const publishInfo = await db.single('RepositoryPublish', { id })
  if (publishInfo) {
    const repository = await db.single('Repository', { id: publishInfo.repositoryId })
    if (repository.url.indexOf('http') === 0) {
      const urlArr = repository.url.split('/')
      const origin = urlArr.slice(0, 3).join('/')
      const git = await db.single('Git', { url: origin })
      if (git) {
        repository.authedUrl = `${urlArr[0]}//${git.username}:${git.password}@${urlArr[2]}/${urlArr.slice(3, urlArr.length).join('/')}`
      }
    }
    const registry = await db.single('Registry', { id: publishInfo.registryId })
    result.id = publishInfo.id
    result.name = publishInfo.name
    result.repository = repository
    result.registry = registry
  }
  return result
}
