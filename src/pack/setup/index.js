import fse from 'fs-extra'
import cmd from '../git/cmd.js'
import stringifyUrl from './stringifyUrl.js'

export default async (config, folder, branch) => {
  // if OS is windows
  // if(process.platform === 'win32') {
  //   await cmd("ipconfig /flushdns", { cwd: folder });
  // }

  if (!(await fse.exists(`${folder}/.git`))) {
    const parentFolder = folder.split('/').slice(0, -1).join('/')
    const name = folder.split('/').pop()
    await fse.ensureDir(parentFolder)
    const url = stringifyUrl(config)
    await cmd(`git clone ${url} ${name}`, { cwd: parentFolder })
  } else {
    await cmd('git fetch', { cwd: folder })
  }

  if (branch) {
    await cmd('git clean -df', { cwd: folder })
    await cmd(`git checkout ${branch}`, { cwd: folder })
  }
}
