import setup from '../git/setup/index.js'
import getVersions from '../utils/getVersions.js'

export default async (app, { url, username, password }) => {
  if (url.indexOf('http') === 0) {
    const urlArr = url.split('/')

    const protocol = urlArr.shift()
    urlArr.shift() // remove empty string
    const suffixUrl = urlArr.join('/')
    const authedUrl = `${protocol}//${username}:${password}@${suffixUrl}`

    console.log(authedUrl)

    const rootPath = `${process.cwd()}/tmp/version/${app}`
    await setup(rootPath, authedUrl)
    return await getVersions(rootPath)
  }
}
