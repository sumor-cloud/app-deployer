import {
  beforeAll,
  describe, expect, it
} from '@jest/globals'
import os from 'os'
import fse from 'fs-extra'
import buildNodeJS from '../../src/version/scale/buildNodeJS.js'
import buildImage from '../../src/version/scale/buildImage.js'
import testConfig from '../config.js'
import SSH from '../../src/ssh/index.js'

const tmpPath = `${os.tmpdir()}/sumor-deployer-test/scale`

describe('Scale Version', () => {
  beforeAll(async () => {
    await fse.remove(tmpPath)
  })
  it('Build Node.JS Package', async () => {
    const sourceFolder = `${process.cwd()}/test/demoapp`
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

      let images = await ssh.docker.images()
      const existsImage = images.filter((obj) => obj.Repository === 'test-deployer' && obj.Tag === '1.0.0')[0]
      if (existsImage) {
        await ssh.docker.deleteImage('test-deployer', '1.0.0')
      }

      await buildImage(ssh, {
        app: 'test-deployer',
        version: '1.0.0',
        source: tmpPath
      })

      images = await ssh.docker.images()
      const image1 = images.filter((obj) => obj.Repository === 'test-deployer' && obj.Tag === '1.0.0')[0]
      expect(image1).toBeTruthy()

      await ssh.docker.deleteImage('test-deployer', '1.0.0')

      images = await ssh.docker.images()
      const image2 = images.filter((obj) => obj.Repository === 'test-deployer' && obj.Tag === '1.0.0')[0]
      expect(image2).toBeFalsy()

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
    }
  }, 3 * 60 * 1000)
})
