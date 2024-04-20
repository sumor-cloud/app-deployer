import {
  beforeAll,
  describe, expect, it
} from '@jest/globals'
import os from 'os'
import fse from 'fs-extra'
import buildNodeJS from '../../src/version/build/buildNodeJS.js'
import buildImage from '../../src/version/build/buildImage.js'
import checkImageExists from '../../src/version/build/checkImageExists.js'
import testConfig from '../config.js'
import SSH from '../../src/ssh/index.js'

const tmpPath = `${os.tmpdir()}/sumor-deployer-test/build`

describe('Build Version', () => {
  beforeAll(async () => {
    await fse.remove(tmpPath)
  })
  it('Build Node.JS Package', async () => {
    const sourceFolder = `${process.cwd()}/test/demo/app`
    await buildNodeJS(sourceFolder, tmpPath)

    const demoFile = await fse.readFile(`${tmpPath}/demo.js`, 'utf-8')
    expect(demoFile).toBe('export default "OK"')

    await fse.remove(`${tmpPath}/demo.js`)

    await buildNodeJS(tmpPath, tmpPath)
    const demoFile2 = await fse.readFile(`${tmpPath}/demo.js`, 'utf-8')
    expect(demoFile2).toBe('export default "OK"')
  }, 60 * 1000)
  it('Build Node.JS Image', async () => {
    const ssh = new SSH(testConfig.server.main)
    try {
      await ssh.connect()

      // clean up the image before testing
      const imageExists = await checkImageExists(ssh, 'test-deployer-build', '1.0.0')
      if (imageExists) {
        await ssh.docker.removeImage('test-deployer-build', '1.0.0')
      }

      await buildImage(ssh, {
        app: 'test-deployer-build',
        version: '1.0.0',
        source: tmpPath
      })

      const imageExists1 = await checkImageExists(ssh, 'test-deployer-build', '1.0.0')
      expect(imageExists1).toBeTruthy()

      await ssh.docker.removeImage('test-deployer-build', '1.0.0')

      const imageExists2 = await checkImageExists(ssh, 'test-deployer-build', '1.0.0')
      expect(imageExists2).toBeFalsy()

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
  }, 5 * 60 * 1000)
})
