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
  beforeAll(
    async () => {
      config.root = root
      await fse.remove(root)
      await fse.ensureDir(root)

      const ssh = new SSH(config.server.main)
      await ssh.connect()
      lockId = await ssh.lock.lock(lockName, 20 * 60 * 1000)

      const app = 'demo'
      const remotePath = `/usr/sumor-cloud/version/${app}`
      await ssh.file.remove(remotePath)
      await ssh.disconnect()
    },
    10 * 60 * 1000
  )
  afterAll(
    async () => {
      await fse.remove(root)
      const ssh = new SSH(config.server.main)
      await ssh.connect()
      await ssh.lock.release(lockName, lockId)
      await ssh.disconnect()
    },
    10 * 60 * 1000
  )

  it(
    'create instance',
    async () => {
      const app = 'demo'
      const env = 'production'
      const version = 'd0d72127ca8105b8de621749d671fb5c1258938b' // 1.1.0
      const server = 'main'

      const configPath = `${root}/configs/${app}/${env}/config.json`
      await fse.ensureFile(configPath)
      await fse.writeJson(configPath, { name: 'DEMO' })

      const ssh = new SSH(config.server.main)
      await ssh.connect()
      const dockerId = await createInstance(config, {
        app,
        env,
        version,
        server
      })

      const port = dockerId.split('_').pop()

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

      const existsConfigFile = await ssh.file.exists(
        `/usr/sumor-cloud/runtime/${env}/${app}/${port}/config/config.json`
      )

      await ssh.docker.remove(dockerId)
      await ssh.disconnect()

      expect(pingError).toBeUndefined()
      expect(response.feature1).toBe('ABC1234DE')

      expect(existsConfigFile).toBe(true)
    },
    5 * 60 * 1000
  )

  it(
    'deploy',
    async () => {
      const app = 'demo'
      const env = 'production'
      const version = '6cdcbfc7784bdb3cddf09270f5aa853634620c38' // 1.0.0
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
      expect(response.feature1).toBe('ABC12') // 1.0.1

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
