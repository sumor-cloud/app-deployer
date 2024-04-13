import clone from '../setup/index.js'
import getBranchVersions from './getBranchVersions.js'
import os from 'os'

export default async (config) => {
  const versions = {}
  for (const app in config.source) {
    console.log(`应用${app}正在检查应用版本`)
    const clonePath = `${os.tmpdir()}/sumor-deploy/version/${app}`
    await clone(clonePath, config.source[app])
    versions[app] = await getBranchVersions(clonePath)
    console.log('应用版本列表')
    for (const version in versions[app]) {
      console.log(`- ${version}${versions[app][version].beta ? ' 测试版' : ''}`)
    }
    console.log(`应用${app}检查应用版本完成`)
  }
  return versions
}
