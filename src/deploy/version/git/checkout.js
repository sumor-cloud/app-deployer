import git from '../../git/git.js'

export default async (root, target) => {
  await git(root, 'clean -df')
  await git(root, `checkout ${target}`)
}
