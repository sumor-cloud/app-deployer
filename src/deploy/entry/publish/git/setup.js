import fse from 'fs-extra'
import parsePath from '../../../../utils/git/parsePath.js'
import cmd from '../../../../utils/cmd.js'
import getBranchs from '../../../../utils/git/branchs.js'
import git from '../../../../utils/git/git.js'

const initFiles = async (root) => {
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
export default async (root, source) => {
  if (!await fse.exists(root)) {
    const { name, folder } = parsePath(root)
    await fse.ensureDir(folder)
    await cmd(`git clone ${source} ${name}`, { cwd: folder })
  }
  await cmd('git config user.name builder', { cwd: root })
  await cmd('git config user.email builder@dummy.com', { cwd: root })
  const branchs = await getBranchs(root)
  const baseVersion = branchs.filter((obj) => obj.name === '1.0')[0]
  if (!baseVersion) {
    await git(root, 'checkout --orphan 1.0')
    await git(root, 'reset --hard')
    await initFiles(root)
    await git(root, 'add . -f')
    await git(root, 'commit -m "初始化"')
    await git(root, 'push -f origin 1.0')
  } else {
    await git(root, 'checkout 1.0')
    await git(root, 'pull')
  }
}
