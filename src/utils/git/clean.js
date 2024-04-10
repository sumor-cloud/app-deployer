import fse from 'fs-extra'
import git from './git.js'

const setup = async (root) => {
  await fse.writeFile(`${root}/.gitignore`, `# IDE configuration
.idea

# generated files
node_modules
output
dist
tmp

# system
.DS_Store`)
  await fse.writeFile(`${root}/README.md`, '')
}
export default async (root, version) => {
  await git(root, 'checkout --orphan cleanup')
  await git(root, 'reset --hard')
  await setup(root)
  await git(root, 'add .')
  await git(root, 'commit -m "初始化"')
  await git(root, `branch -D ${version}`)
  await git(root, `branch -m ${version}`)
  await git(root, `push -f origin ${version}`)
}
