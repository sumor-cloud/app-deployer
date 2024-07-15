import { beforeAll, afterAll, describe, expect, it } from '@jest/globals'
import fse from 'fs-extra'
import repo from '../assets/repo.js'
import pack from '../../src/pack/index.js'
import getTmpDir from '../test-utils/getTmpDir.js'

const config = {
  source: {
    version: repo.version
  }
}

describe('Version Tools', () => {
  const root = getTmpDir('pack-entry')
  beforeAll(async () => {
    await fse.remove(root)
    await fse.ensureDir(root)
  })
  afterAll(async () => {
    await fse.remove(root)
  })
  it(
    'Pack',
    async () => {
      config.root = root
      await pack(config, 'version', '1.0.0')
      const cachePath = `${root}/versions/version/cache.json`
      const existsCacheFile = await fse.exists(cachePath)
      expect(existsCacheFile).toBeTruthy()

      const versionPath = `${root}/versions/version/6cdcbfc7784bdb3cddf09270f5aa853634620c38.zip`
      const existsVersionFile = await fse.exists(versionPath)
      expect(existsVersionFile).toBeTruthy()

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
