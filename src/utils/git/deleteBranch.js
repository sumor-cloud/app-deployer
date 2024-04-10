import git from './git.js'

export default async (root, version) => {
  try {
    await git(root, 'checkout 1.0')
    await git(root, `branch -D ${version}`)
    await git(root, `push origin --delete ${version}`)
  } catch (e) {
    //
  }
}
