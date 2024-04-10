import git from './git.js'

export default async (root, branch) => {
  const info = await git(root, `log ${branch} --pretty=format:"%H|%ad|%cd|%D|%s" --date=iso-strict-local`)

  const commits = info.split('\n')
  const result = []
  for (const commit of commits) {
    const fields = commit.split('|')
    const tags = []
    let subject = ''
    if (fields[3]) {
      const items = fields[3].split(',')
      for (const item of items) {
        if (item.indexOf('tag') >= 0) {
          tags.push(item.replace('tag:', '').trim())
        }
      }
    }
    if (fields[4]) {
      subject = fields[4]
    }
    result.push({
      id: fields[0],
      authorDate: new Date(fields[1]),
      committerDate: new Date(fields[2]),
      tags,
      subject
    })
  }
  return result
}
