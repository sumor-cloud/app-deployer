import git from './git.js'
import currentBranch from './currentBranch.js'

export default async (root) => {
  const branch = await currentBranch(root)
  await git(root, `push origin ${branch.name}`)
}
