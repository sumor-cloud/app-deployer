import git from './git.js'

export default async (root, text) => {
  await git(root, 'add .')
  await git(root, `commit -m "${text}"`)
}
