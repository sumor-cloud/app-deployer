import fse from 'fs-extra'
import cmd from '../cmd.js'
import git from './git'
import parsePath from './parsePath.js'

export default async (root) => {
  const { name, folder } = parsePath(root)
  await fse.ensureDir(folder)
  await cmd(`git init ${name}`, { cwd: folder })
  await git(root, 'branch -m master 1.0')
}
