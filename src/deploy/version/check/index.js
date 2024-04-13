import clone from '../git/setup/index.js'
import getVersions from './getVersions.js'

export default async (config) => {
  const versions = {}
  for (const app in config.source) {
    console.log(`应用${app}正在检查应用版本`)
    const clonePath = `${process.cwd()}/tmp/version/${app}`
    await clone(clonePath, config.source[app])
    versions[app] = await getVersions(clonePath)
    console.log('应用版本列表')
    for (const version in versions[app]) {
      console.log(`- ${version}${versions[app][version].beta ? ' 测试版' : ''}`)
    }
    console.log(`应用${app}检查应用版本完成`)
  }
  return versions
}
