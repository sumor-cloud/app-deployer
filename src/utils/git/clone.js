import fse from 'fs-extra'
import cmd from '../cmd.js'
import parsePath from './parsePath.js'

export default async (root, source) => {
  const { name, folder } = parsePath(root)
  await fse.ensureDir(folder)
  await cmd(`git clone ${source} ${name} -b 1.0`, { cwd: folder })
}
