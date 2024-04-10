import git from '../../../../utils/git/git.js'
import currentBranch from '../../../../utils/git/currentBranch.js'

export default async (root, text) => {
  const branch = await currentBranch(root)
  await git(root, `pull origin ${branch.name}`)
  await git(root, 'add .')
  await git(root, `commit -m "${text}"`)
  await git(root, `push origin ${branch.name}`)
}
