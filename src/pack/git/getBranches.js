import cmd from './cmd.js'

/* Example CMD [git branch -vva] output:

  main                feaacdb [origin/main] Create README.md
* v1.x                b1ece30 [origin/v1.x] fix 5
  remotes/origin/HEAD -> origin/main
  remotes/origin/main feaacdb Create README.md
  remotes/origin/v1.x b1ece30 fix 5
  remotes/origin/v2.x 5145ac7 2.0.0
*/

export default async folder => {
  const info = await cmd('git branch -vva', { cwd: folder })
  const branches = []

  const rows = info.split('\n')
  for (const i in rows) {
    // Split the row by space and remove empty strings
    const fields = rows[i].split(' ').filter(obj => obj !== '')

    const obj = {}
    if (fields[0] === '*') {
      obj.current = true
      fields.shift()
    }
    obj.name = fields.shift()
    if (obj.name === 'remotes/origin/HEAD') {
      continue
    }
    if (fields.length >= 1) {
      obj.commit = fields.shift()
      if (obj.name.indexOf('remotes/origin/') >= 0) {
        obj.remote = obj.name
        obj.name = obj.name.replace('remotes/origin/', '')
      }
      branches.push(obj)
    }
  }

  return branches
}
