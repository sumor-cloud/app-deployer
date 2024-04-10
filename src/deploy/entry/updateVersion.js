import setup from './publish/git/setup.js'
import getVersions from './publish/git/versions.js'

export default async (app, { url, username, password }) => {
  if (url.indexOf('http') === 0) {
    const urlArr = url.split('/')
    const authedUrl = `${urlArr[0]}//${username}:${password}@${urlArr[2]}/${urlArr.slice(3, urlArr.length).join('/')}`
    const rootPath = `${process.cwd()}/tmp/version/${app}`
    await setup(rootPath, authedUrl)
    return await getVersions(rootPath)
  }
}
