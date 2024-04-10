import git from './git.js'

export default async (root, branch) => {
  await git(root, `checkout ${branch}`)
  await git(root, `pull origin ${branch}`)
}
