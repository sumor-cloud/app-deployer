import git from '../../git/git.js'
import getBranches from '../../git/branches.js'
import getCommits from '../utils/commits.js'
import parseVersion from './parseVersion.js'

const timeFormatter = (val) => Math.round(new Date(val).getTime())

export default async (root) => {
  const branches = await getBranches(root)
  const validParentVersionRule = /^\d+\.\d+?$/
  const versions = {}
  for (const branch of branches) {
    if (branch.remote) {
      if (validParentVersionRule.test(branch.name)) {
        branch.major = branch.name.split('.')[0]
        branch.minor = branch.name.split('.')[1]

        await git(root, 'reset --hard HEAD')
        await git(root, `checkout ${branch.origin}`)
        let commits = await getCommits(root, branch.origin)
        commits = commits.reverse()
        let current = 0
        let betaVersion
        for (const commit of commits) {
          let hasVersion = false
          for (const tag of commit.tags) {
            const versionInfo = parseVersion(tag)
            if (
              versionInfo &&
                versionInfo.major === branch.major &&
                versionInfo.minor === branch.minor &&
                versionInfo.patch) { // 符合当前版本的子版本
              const version = versionInfo.code
              versions[version] = {
                id: commit.id,
                name: version,
                authorDate: timeFormatter(commit.authorDate),
                committerDate: timeFormatter(commit.committerDate),
                beta: false
              }
              if (versionInfo.patch >= current) {
                current = versionInfo.patch + 1
              }
              hasVersion = true
            }
          }
          if (!hasVersion) {
            const version = `${branch.major}.${branch.minor}.${current}`
            betaVersion = {
              id: commit.id,
              name: version,
              authorDate: timeFormatter(commit.authorDate),
              committerDate: timeFormatter(commit.committerDate),
              beta: true
            }
          } else {
            betaVersion = undefined
          }
        }
        if (betaVersion) {
          versions[betaVersion.name] = betaVersion
        }
      }
    }
  }
  return versions
}
