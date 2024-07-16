import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'
import fse from 'fs-extra'
import getTmpDir from '../test-utils/getTmpDir.js'
import config from '../assets/config.js'
import SSH from '../../src/utils/SSH.js'

import createInstance from '../../src/deploy/scale/createInstance.js'
import deploy from '../../src/deploy/index.js'

const lockName = 'test-deployer-deploy'
describe('Deploy', () => {
  let lockId
  const root = getTmpDir('deploy')
  beforeAll(async () => {
    config.root = root
    await fse.remove(root)
    await fse.ensureDir(root)

    const ssh = new SSH(config.server.main)
    await ssh.connect()
    lockId = await ssh.lock.lock(lockName, 2 * 60 * 1000)
    await ssh.disconnect()
  }, 60 * 1000)
  afterAll(async () => {
    await fse.remove(root)
    const ssh = new SSH(config.server.main)
    await ssh.connect()
    await ssh.lock.release(lockName, lockId)
    await ssh.disconnect()
  }, 60 * 1000)

  it(
    'create instance',
    async () => {
      const app = 'demo'
      const env = 'production'
      const version = '6cdcbfc7784bdb3cddf09270f5aa853634620c38'
      const server = 'main'
      const dockerId = await createInstance(config, {
        app,
        env,
        version,
        server
      })

      const port = dockerId.split('_').pop()

      const ssh = new SSH(config.server.main)
      await ssh.connect()
      let response
      let pingError
      try {
        await new Promise(resolve => {
          setTimeout(resolve, 5 * 1000)
        })
        response = await ssh.exec(`curl --insecure https://localhost:${port}`, {
          cwd: '/'
        })
        response = JSON.parse(response)
      } catch (e) {
        pingError = e
      }

      const containers = await ssh.docker.containers()
      await ssh.docker.remove(dockerId)
      await ssh.disconnect()

      console.log(containers)

      expect(pingError).toBeUndefined()
      expect(response.feature1).toBe('ABC1234DE5')
      expect(response.feature2).toBe('ABC')
    },
    60 * 1000
  )

  it(
    'deploy',
    async () => {
      const app = 'demo'
      const env = 'production'
      const version = '6cdcbfc7784bdb3cddf09270f5aa853634620c38'
      const server = 'main'
      const dockerId1 = await createInstance(config, {
        app,
        env,
        version,
        server
      })
      const dockerId2 = await createInstance(config, {
        app,
        env,
        version,
        server
      })
      const dockerId3 = await createInstance(config, {
        app,
        env,
        version,
        server
      })

      let error
      try {
        await deploy(config)
      } catch (e) {
        error = e
      }

      const ssh = new SSH(config.server.main)
      await ssh.connect()

      let response
      let pingError
      try {
        await new Promise(resolve => {
          setTimeout(resolve, 5 * 1000)
        })
        response = await ssh.exec(`curl --insecure https://localhost:443`, {
          cwd: '/'
        })
        response = JSON.parse(response)
      } catch (e) {
        pingError = e
      }

      const loadInstances = async () => {
        const instances = await ssh.docker.containers()
        return instances.map(i => i.instanceId)
      }
      const containers1 = await loadInstances()
      const version2Prefix = 'sumor_app_demo_production_63394ad'
      const existingVersion2 = containers1.filter(c => c.startsWith(version2Prefix))
      await ssh.docker.remove(dockerId2)
      await ssh.docker.remove(dockerId3)
      for (const c of existingVersion2) {
        await ssh.docker.remove(c)
      }
      await ssh.docker.remove('sumor_site_443')
      await ssh.disconnect()

      expect(pingError).toBeUndefined()
      expect(response.feature1).toBe('ABC12')

      expect(containers1.indexOf(dockerId1)).toBe(-1)
      expect(containers1.indexOf(dockerId2)).toBeGreaterThan(-1)
      expect(containers1.indexOf(dockerId3)).toBeGreaterThan(-1)

      expect(existingVersion2.length).toBe(4)

      if (error) {
        throw error
      }
    },
    5 * 60 * 1000
  )
})
