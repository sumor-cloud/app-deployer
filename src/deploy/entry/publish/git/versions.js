import git from '../../../../utils/git/git.js'
import getBranchs from '../../../../utils/git/branchs.js'
import getCommits from '../../../../utils/git/commits.js'

const timeFormatter = (val) => Math.round(new Date(val).getTime())

export default async (root) => {
  await git(root, 'fetch')
  const branches = await getBranchs(root)
  const validParentVersionRule = /^\d+\.\d+?$/
  const validSubVersionRule = /^\d+\.\d+\.\d+?$/
  const versions = {}
  for (const branch of branches) {
    if (branch.remote) {
      if (validParentVersionRule.test(branch.name)) {
        await git(root, 'reset --hard HEAD')
        await git(root, `checkout ${branch.origin}`)
        let commits = await getCommits(root, branch.origin)
        commits = commits.reverse()
        let current = 0
        for (const commit of commits) {
          let isBeta = true
          for (const tag of commit.tags) {
            if (validSubVersionRule.test(tag)) {
              const subVersion = parseInt(tag.split(`${branch.name}.`)[1], 10)
              if (!isNaN(subVersion)) { // 符合当前版本的子版本
                versions[tag] = {
                  id: commit.id,
                  name: tag,
                  authorDate: timeFormatter(commit.authorDate),
                  committerDate: timeFormatter(commit.committerDate),
                  beta: false
                }
                if (subVersion >= current) {
                  current = subVersion + 1
                }
                isBeta = false
              }
            }
          }
          if (isBeta) {
            versions[`${branch.name}.${current}`] = {
              id: commit.id,
              name: `${branch.name}.${current}`,
              authorDate: timeFormatter(commit.authorDate),
              committerDate: timeFormatter(commit.committerDate),
              beta: true
            }
          }
        }
      }
    }
  }
  return versions
}
