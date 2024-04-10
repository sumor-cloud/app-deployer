import git from './git.js'
// import currentBranch from "../../src/git/currentBranch";
export default async (root, version) => {
  // const branch = await currentBranch(root);
  await git(root, `tag ${version}`)
  await git(root, 'push --tag')
}
