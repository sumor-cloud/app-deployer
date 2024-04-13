import git from './git.js'

export default async (root, version) => {
  try {
    await git(root, `tag -d ${version}`)
    await git(root, `push origin :refs/tags/${version}`)
  } catch (e) {
    //
  }
}
