import getBranches from '../git/getBranches.js'
import getVersions from './getVersions.js'
import parseBranchVersion from './parseBranchVersion.js'

export default async root => {
  const branches = await getBranches(root)
  const versions = {}

  for (const branch of branches) {
    if (branch.remote) {
      const { priority } = parseBranchVersion(branch.remote)
      if (priority) {
        const branchVersions = await getVersions(root, branch.remote)
        for (const version in branchVersions) {
          branchVersions[version].priority = priority
          branchVersions[version].branch = branch.remote
          if (!versions[version] || versions[version].priority < priority) {
            versions[version] = branchVersions[version]
          }
        }
      }
    }
  }
  return versions
}
