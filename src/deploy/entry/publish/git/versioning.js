import git from '../../../../utils/git/git.js'
import getVersions from './versions.js'
import getBranchs from '../../../../utils/git/branchs.js'

export default async (root, version, target) => {
  await git(root, `checkout ${version}`)
  const versions = await getVersions(root)
  if (target) {
    // 升级版本
    let largestVersion
    for (const currentVersion in versions) {
      const currentVersionInfo = versions[currentVersion]
      if (!currentVersionInfo.beta &&
                currentVersion.indexOf(version) === 0) {
        if (!largestVersion ||
                    largestVersion.name < currentVersionInfo.name) {
          largestVersion = currentVersionInfo
        }
      }
    }
    if (largestVersion) {
      const branchs = await getBranchs(root)
      const matchedBranch = branchs.filter((obj) => obj.remote && obj.name === largestVersion.name)[0]
      if (!matchedBranch) {
        await git(root, `checkout ${largestVersion.id}`)
        await git(root, `branch ${target}`)
        await git(root, `push origin ${target}`)
      }
    }
  } else {
    // 发布版本
    for (const currentVersion in versions) {
      const currentVersionInfo = versions[currentVersion]
      if (currentVersionInfo.beta &&
                currentVersion.indexOf(version) === 0) {
        await git(root, `checkout ${currentVersionInfo.id}`)
        await git(root, `tag ${currentVersion}`)
        await git(root, 'push --tag')
      }
    }
  }
}
