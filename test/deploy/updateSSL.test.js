import {
  describe, expect, it, beforeAll, afterAll
} from '@jest/globals'

import testConfig from '../config.js'
import SSH from '../../src/deploy/ssh/index.js'
import updateSSL from '../../src/deploy/updateSSL/index.js'

describe('Update SSL', () => {
  beforeAll(async () => {
    const ssh = new SSH(testConfig.server.main)
    await ssh.connect()
    await ssh.exec('rm -rf /usr/sumor-cloud/ssl')
    await ssh.disconnect()
  })
  afterAll(async () => {
    const ssh = new SSH(testConfig.server.main)
    await ssh.connect()
    await ssh.exec('rm -rf /usr/sumor-cloud/ssl')
    await ssh.disconnect()
  })
  it('Update SSL', async () => {
    await updateSSL(testConfig)
    const ssh = new SSH(testConfig.server.main)
    await ssh.connect()
    const exists = await ssh.file.exists('/usr/sumor-cloud/ssl/demo.sumor.com/domain.cer')
    await ssh.disconnect()

    expect(exists).toBe(true)
  })
})
