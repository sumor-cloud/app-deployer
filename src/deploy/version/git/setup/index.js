import fse from 'fs-extra'
import parsePath from '../../../git/parsePath.js'
import cmd from '../../../../utils/cmd.js'
import getBranches from '../../../git/branches.js'
import git from '../../../git/git.js'

import initFiles from './initFiles.js'

export default async (root, source) => {
  if (!await fse.exists(root)) {
    const { name, folder } = parsePath(root)
    await fse.ensureDir(folder)
    await cmd(`git clone ${source} ${name}`, { cwd: folder })
  }
  const branches = await getBranches(root)
  const baseVersion = branches.filter((obj) => obj.name === '1.0')[0]
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
