import { beforeAll, afterAll, describe, expect, it } from '@jest/globals'
import fse from 'fs-extra'
import repo from '../assets/repo.js'
import pack from '../../src/pack/index.js'
import getTmpDir from '../test-utils/getTmpDir.js'
import unzip from '../../src/utils/unzip.js'

const config = {
  source: {
    version: repo.version
  }
}

describe('Version Tools', () => {
  const root = getTmpDir('pack-entry')
  beforeAll(async () => {
    config.root = root
    await fse.remove(root)
    await fse.ensureDir(root)
  })
  afterAll(async () => {
    await fse.remove(root)
  })
  it(
    'Pack',
    async () => {
      const id = await pack(config, 'version', '1.0.0')
      const cachePath = `${root}/versions/version/cache.json`
      const existsCacheFile = await fse.exists(cachePath)
      expect(existsCacheFile).toBeTruthy()
      expect(id).toEqual('6cdcbfc7784bdb3cddf09270f5aa853634620c38')

      const versionPath = `${root}/versions/version/6cdcbfc7784bdb3cddf09270f5aa853634620c38.zip`
      const existsVersionFile = await fse.exists(versionPath)
      expect(existsVersionFile).toBeTruthy()

      // unzip version file
      const tmpPath = `${root}/pack-test/version1`
      await fse.ensureDir(tmpPath)
      await unzip(versionPath, tmpPath)
      const versionPackage = await fse.readJson(`${tmpPath}/package.json`)
      expect(versionPackage.version).toEqual('1.0.0')

      const cacheFile = await fse.readJson(cachePath)

      await pack(config, 'version', '1.1.1')
      const newCacheFile = await fse.readJson(cachePath)
      expect(newCacheFile.time).toEqual(cacheFile.time)

      const newVersionPath = `${root}/versions/version/b1ece30cf278de4ff71ef2955d004b895848db8e.zip`
      const existsNewVersionFile = await fse.exists(newVersionPath)
      expect(existsNewVersionFile).toBeTruthy()
    },
    60 * 1000
  )
})
