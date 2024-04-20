import {
  beforeAll,
  afterAll,
  describe, expect, it
} from '@jest/globals'
import os from 'os'
import buildNodeJS from '../src/version/build/buildNodeJS.js'
import buildImage from '../src/version/build/buildImage.js'
import SSH from '../src/ssh/index.js'
import testConfig from './config.js'
import scaleNodeJSInstance from '../src/scale/scaleNodeJSInstance.js'

const tmpPath = `${os.tmpdir()}/sumor-deployer-test/scale`
const sourceFolder = `${process.cwd()}/test/demo/app`
const configFolder = `${process.cwd()}/test/demo/config`
const remoteConfigPath = '/usr/sumor-cloud/config/demo_test'
const lockName = 'test-deployer-scale'
describe('Scale Version', () => {
  let lockId
  beforeAll(async () => {
    const ssh = new SSH(testConfig.server.main)
    await ssh.connect()
    lockId = await ssh.lock.lock(lockName, 2 * 60 * 1000)
    await ssh.disconnect()
  }, 10 * 60 * 1000)
  afterAll(async () => {
    const ssh = new SSH(testConfig.server.main)
    await ssh.connect()
    await ssh.lock.release(lockName, lockId)
    await ssh.disconnect()
  }, 10 * 60 * 1000)
  it('Scale Node.JS Docker Instance', async () => {
    await buildNodeJS(sourceFolder, tmpPath)

    const ssh = new SSH(testConfig.server.main)
    try {
      await ssh.connect()

      // clean up the image before testing
      await ssh.docker.removeImage('test-deployer-scale', '1.0.0')
      await buildImage(ssh, {
        app: 'test-deployer-scale',
        version: '1.0.0',
        source: tmpPath
      })

      console.log(`Scale NodeJS Instance with Domain: ${testConfig.server.main.domain}`)
      const dockerId = await scaleNodeJSInstance(ssh, {
        app: 'test-deployer-scale',
        version: '1.0.0',
        env: 'test',
        localConfig: configFolder,
        remoteConfig: remoteConfigPath
      })

      console.log(`Docker running with ID: ${dockerId}`)

      const port = dockerId.split('_').pop()

      console.log(`Check if the instance is running at ${port}`)
      let response
      let pingError
      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 5 * 1000)
        })
        response = await ssh.exec(`curl --insecure https://localhost:${port}`, {
          cwd: '/'
        })
        response = JSON.parse(response)
      } catch (e) {
        pingError = e
      }

      await ssh.docker.remove(dockerId)
      await ssh.docker.removeImage('test-deployer-scale', '1.0.0')

      if (pingError) {
        throw pingError
      }

      expect(response.status).toBe('OK')
      expect(response.config.title).toBe('DEMO')

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
  }, 5 * 60 * 1000)
  // it('Scale Node.JS Docker Instance With SSL', async () => {
  //
  //   // domain: testConfig.server.main.domain,
  // }, 60 * 1000)
})
