import cmd from '../../deploy/scale/version/cmd.js'

export default async folder => {
  const currentBranch = await cmd('git branch --show-current', { cwd: folder })
  return currentBranch.replace(/\n/g, '')
}
