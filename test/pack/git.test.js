import { beforeAll, describe, expect, it } from '@jest/globals'
import fse from 'fs-extra'
import clone from '../../src/pack/setup/index.js'
import repo from '../assets/repo.js'
import getBranches from '../../src/pack/git/getBranches.js'
import getCommits from '../../src/pack/git/getCommits.js'
import getTmpDir from '../test-utils/getTmpDir.js'
describe('Version Tools', () => {
  const root = getTmpDir('pack-git')
  beforeAll(async () => {
    await fse.remove(root)
  })

  it(
    'Branches',
    async () => {
      const path = `${root}/branch`
      await clone(repo.version, path)
      const branches = await getBranches(path)
      expect(branches).toBeDefined()

      const expectResult = [
        {
          current: true,
          name: 'main',
          commit: 'feaacdb'
        },
        {
          name: 'main',
          commit: 'feaacdb',
          remote: 'remotes/origin/main'
        },
        {
          name: 'v1.x',
          commit: 'b1ece30',
          remote: 'remotes/origin/v1.x'
        },
        {
          name: 'v2.x',
          commit: '5145ac7',
          remote: 'remotes/origin/v2.x'
        }
      ]
      expect(branches).toEqual(expectResult)
    },
    60 * 1000
  )
  it(
    'Commits',
    async () => {
      const path = `${root}/version`
      await clone(repo.version, path)
      const commits = await getCommits(path, 'v1.x')
      expect(commits).toBeDefined()

      const expectFilePath = `${process.cwd()}/test/assets/expect/commits.json`
      // await fse.writeFile(expectFilePath,JSON.stringify(commits,null,4));
      const expectResult = await fse.readJson(expectFilePath)
      expect(commits).toEqual(expectResult)
    },
    60 * 1000
  )
})
