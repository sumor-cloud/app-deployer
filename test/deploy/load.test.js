import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'
import fse from 'fs-extra'
import getTmpDir from '../test-utils/getTmpDir.js'
import config from '../assets/config.js'
import SSH from '../../src/utils/SSH.js'

import loadVersions from '../../src/deploy/load/loadVersions.js'
import loadInstances from '../../src/deploy/load/loadInstances.js'

const lockName = 'test-deployer-deploy-load'
describe('Deploy', () => {
  let lockId
  const root = getTmpDir('deploy-load')
  beforeAll(
    async () => {
      config.root = root
      await fse.remove(root)
      await fse.ensureDir(root)

      const ssh = new SSH(config.server.main)
      await ssh.connect()
      lockId = await ssh.lock.lock(lockName, 2 * 60 * 1000)
      await ssh.disconnect()
    },
    5 * 60 * 1000
  )
  afterAll(async () => {
    await fse.remove(root)
    const ssh = new SSH(config.server.main)
    await ssh.connect()
    await ssh.lock.release(lockName, lockId)
    await ssh.disconnect()
  }, 60 * 1000)
  it(
    'load versions',
    async () => {
      const versions = await loadVersions(config)
      expect(versions.demo).toBeDefined()
      expect(versions.demo['1.0.0'].id).toEqual('6cdcbfc7784bdb3cddf09270f5aa853634620c38')
    },
    60 * 1000
  )
  it(
    'load instances',
    async () => {
      const instances = await loadInstances(config)
      expect(instances.main).toBeDefined()
    },
    60 * 1000
  )
})
