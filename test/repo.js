import fs from 'fs'

let repo = fs.readFileSync(`${process.cwd()}/test/config/repo.json`, 'utf-8')
repo = JSON.parse(repo)

export default repo
