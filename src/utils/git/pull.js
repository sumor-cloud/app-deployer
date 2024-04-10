import git from './git.js'

export default async (root) => {
  await git(root, 'pull')
}
