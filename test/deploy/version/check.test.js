import {
  beforeAll,
  describe, expect, it
} from '@jest/globals'
import parseTagVersion from '../../../src/deploy/version/check/parseTagVersion.js'
import fse from 'fs-extra'
import clone from '../../../src/deploy/version/setup/index.js'
import repo from '../../repo.js'
import getBranches from '../../../src/deploy/version/check/getBranches.js'
import getVersions from '../../../src/deploy/version/check/getVersions.js'
import getCommits from '../../../src/deploy/version/check/getCommits.js'
import parseBranchVersion from '../../../src/deploy/version/check/parseBranchVersion.js'
import getBranchVersions from '../../../src/deploy/version/check/getBranchVersions.js'
describe('Version Tools', () => {
  const root = `${process.cwd()}/tmp/test/git/version/check`
  beforeAll(async () => {
    await fse.remove(root)
  })
  it('Parse Version Failed', async () => {
    const tag = 'other'
    const version = parseTagVersion(tag)
    expect(version).toBeUndefined()
  })
  it('Parse Version 1.0.0', async () => {
    const tag = '1.0.0'
    const version = parseTagVersion(tag)
    expect(version.name).toBe('1.0.0')
    expect(version.major).toBe(1)
    expect(version.minor).toBe(0)
    expect(version.patch).toBe(0)
  })
  it('Parse Version v1.0.1', async () => {
    const tag = 'v1.0.1'
    const version = parseTagVersion(tag)
    expect(version.name).toBe('1.0.1')
    expect(version.major).toBe(1)
    expect(version.minor).toBe(0)
    expect(version.patch).toBe(1)
  })

  it('Branches', async () => {
    const path = `${root}/branch`
    await clone(path, repo.version)
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
  }, 60 * 1000)
  it('Commits', async () => {
    const path = `${root}/version`
    await clone(path, repo.version)
    const commits = await getCommits(path, 'v1.x')
    expect(commits).toBeDefined()

    const expectFilePath = `${process.cwd()}/test/deploy/version/expect/commits.json`
    // await fse.writeFile(expectFilePath,JSON.stringify(commits,null,4));
    const expectResult = await fse.readJson(expectFilePath)
    expect(commits).toEqual(expectResult)
  }, 60 * 1000)
  it('Default Version', async () => {
    const version1 = parseBranchVersion('v1.x')
    expect(version1).toEqual({
      major: 1,
      priority: 2
    })
    const version2 = parseBranchVersion('v2.0')
    expect(version2).toEqual({
      major: 2,
      minor: 0,
      priority: 3
    })
    const version3 = parseBranchVersion('v3')
    expect(version3).toEqual({
      major: 3,
      priority: 2
    })
    const version4 = parseBranchVersion('1.x')
    expect(version4).toEqual({
      major: 1,
      priority: 2
    })
    const version5 = parseBranchVersion('2.0')
    expect(version5).toEqual({
      major: 2,
      minor: 0,
      priority: 3
    })
    const version6 = parseBranchVersion('3')
    expect(version6).toEqual({
      major: 3,
      priority: 2
    })
    const version7 = parseBranchVersion('remotes/origin/3.1')
    expect(version7).toEqual({
      major: 3,
      minor: 1,
      priority: 3
    })
    const version8 = parseBranchVersion('main')
    expect(version8).toEqual({
      priority: 1
    })
  })
  it('Versions', async () => {
    const path = `${root}/version`
    await clone(path, repo.version)

    const versions = await getVersions(path, 'main')
    expect(versions).toBeDefined()
    const expectFilePath = `${process.cwd()}/test/deploy/version/expect/versions.json`
    // await fse.writeFile(expectFilePath,JSON.stringify(versions,null,4));
    const expectResult = await fse.readJson(expectFilePath)
    expect(versions).toEqual(expectResult)

    const versions1 = await getVersions(path, 'v1.x')
    expect(versions1).toBeDefined()
    const expectFilePath1 = `${process.cwd()}/test/deploy/version/expect/versions1.json`
    // await fse.writeFile(expectFilePath1,JSON.stringify(versions1,null,4));
    const expectResult1 = await fse.readJson(expectFilePath1)
    expect(versions1).toEqual(expectResult1)

    const versions2 = await getVersions(path, 'v2.x')
    expect(versions2).toBeDefined()
    const expectFilePath2 = `${process.cwd()}/test/deploy/version/expect/versions2.json`
    // await fse.writeFile(expectFilePath2,JSON.stringify(versions2,null,4));
    const expectResult2 = await fse.readJson(expectFilePath2)
    expect(versions2).toEqual(expectResult2)

    const branchVersion = await getBranchVersions(path)
    expect(branchVersion).toBeDefined()
    const expectFilePath3 = `${process.cwd()}/test/deploy/version/expect/branchVersion.json`
    // await fse.writeFile(expectFilePath3,JSON.stringify(branchVersion,null,4));
    const expectResult3 = await fse.readJson(expectFilePath3)
    expect(branchVersion).toEqual(expectResult3)
  }, 60 * 1000)
})
