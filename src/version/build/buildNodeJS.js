import fse from 'fs-extra'
import cmd from '../../utils/cmd.js'

export default async (sourceFolder, targetFolder) => {
  targetFolder = targetFolder || sourceFolder
  await fse.ensureDir(targetFolder)
  if (sourceFolder !== targetFolder) {
    await fse.copy(sourceFolder, targetFolder)
  }
  await cmd('npm i', { cwd: targetFolder }, (data) => {
    console.log(data)
  })
  await cmd('npm run build', { cwd: targetFolder }, (data) => {
    console.log(data)
  })
  await fse.remove(`${targetFolder}/node_modules`)
  await fse.remove(`${targetFolder}/tmp`)
}
