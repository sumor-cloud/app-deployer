import { beforeAll, describe, expect, it } from '@jest/globals'
import parseTagVersion from '../../src/pack/check/parseTagVersion.js'
import fse from 'fs-extra'
import clone from '../../src/pack/setup/index.js'
import repo from '../assets/repo.js'
import getVersions from '../../src/pack/check/getVersions.js'
import parseBranchVersion from '../../src/pack/check/parseBranchVersion.js'
import getBranchVersions from '../../src/pack/check/getBranchVersions.js'
import check from '../../src/pack/check/index.js'
import getTmpDir from '../test-utils/getTmpDir.js'
describe('Version Tools', () => {
  const root = getTmpDir('pack-check')
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
  it(
    'Versions',
    async () => {
      const path = `${root}/version`
      await clone(repo.version, path)

      const versions = await getVersions(path, 'main')
      expect(versions).toBeDefined()
      const expectFilePath = `${process.cwd()}/test/assets/expect/versions.json`
      // await fse.writeFile(expectFilePath,JSON.stringify(versions,null,4));
      const expectResult = await fse.readJson(expectFilePath)
      expect(versions).toEqual(expectResult)

      const versions1 = await getVersions(path, 'v1.x')
      expect(versions1).toBeDefined()
      const expectFilePath1 = `${process.cwd()}/test/assets/expect/versions1.json`
      // await fse.writeFile(expectFilePath1,JSON.stringify(versions1,null,4));
      const expectResult1 = await fse.readJson(expectFilePath1)
      expect(versions1).toEqual(expectResult1)

      const versions2 = await getVersions(path, 'v2.x')
      expect(versions2).toBeDefined()
      const expectFilePath2 = `${process.cwd()}/test/assets/expect/versions2.json`
      // await fse.writeFile(expectFilePath2,JSON.stringify(versions2,null,4));
      const expectResult2 = await fse.readJson(expectFilePath2)
      expect(versions2).toEqual(expectResult2)

      const branchVersion = await getBranchVersions(path)
      expect(branchVersion).toBeDefined()
      const expectFilePath3 = `${process.cwd()}/test/assets/expect/branchVersion.json`
      // await fse.writeFile(expectFilePath3,JSON.stringify(branchVersion,null,4));
      const expectResult3 = await fse.readJson(expectFilePath3)
      expect(branchVersion).toEqual(expectResult3)
    },
    60 * 1000
  )
  it(
    'Entry',
    async () => {
      const config = {
        source: {
          version: repo.version
        }
      }
      const versions = await check(config)
      expect(versions).toBeDefined()
      const expectFilePath = `${process.cwd()}/test/assets/expect/branchVersion.json`
      const expectResult = await fse.readJson(expectFilePath)
      expect(versions).toEqual({
        version: expectResult
      })
    },
    60 * 1000
  )
})
