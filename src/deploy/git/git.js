import cmd from '../../utils/cmd.js'

export default async (root, str) =>
// console.log(`${root}> git ${str}`);
  await cmd(`git ${str}`, { cwd: root })
