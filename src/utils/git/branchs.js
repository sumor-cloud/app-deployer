import cmd from '../cmd.js'

export default async (root) => {
  const info = await cmd('git branch -vva', { cwd: root })
  const branch = []
  const rows = info.split('\n')
  for (const i in rows) {
    const fields = rows[i].split(' ').filter((obj) => obj !== '')
    if (fields.length >= 3) {
      const obj = {}
      if (fields[0] === '*') {
        obj.current = true
        fields.shift()
      }
      obj.name = fields.shift()
      obj.commit = fields.shift()
      // obj.remote = fields.shift();
      if (obj.name.indexOf('remotes/origin') >= 0) {
        obj.remote = true
        obj.origin = obj.name
        obj.name = obj.origin.replace('remotes/origin/', '')
      }
      branch.push(obj)
    }
  }
  return branch
}
