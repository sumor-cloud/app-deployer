import git from './git.js'
import currentBranch from './currentBranch.js'

export default async (root, remote) => {
  const branch = await currentBranch(root)
  await git(root, `remote add origin ${remote}`)
  await git(root, `push origin ${branch.name}`)
}
