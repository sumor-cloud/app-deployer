import {
  describe, expect, it
} from '@jest/globals'

import SSH from '../../src/ssh/SSH.js'
import server from './server.js'

describe('SSH', () => {
  it('connect failed', async () => {
    const wrongServer = {
      host: 'wrong',
      username: 'wrong',
      password: 'wrong',
      port: 22
    }
    const ssh = new SSH(wrongServer)
    let error = null
    try {
      await ssh.connect()
    } catch (e) {
      error = e
    }
    expect(error).not.toBeNull()
  })
  it('connect', async () => {
    const ssh = new SSH(server)
    await ssh.disconnect() // only for test disconnect without connect
    await ssh.connect()

    try {
      // Test command execution
      const result = await ssh.exec('echo "OK"')
      expect(result).toStrictEqual('OK')

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
  })
  it('install', async () => {
    const ssh = new SSH(server)
    await ssh.connect()

    try {
      let installed = await ssh.isInstalled('htop')
      expect(installed).toStrictEqual(false)

      // Test software installation
      await ssh.install('htop')
      await ssh.install('htop') // only for test software already installed
      installed = await ssh.isInstalled('htop')
      expect(installed).toStrictEqual(true)

      // Test software uninstallation
      await ssh.uninstall('htop')
      await ssh.uninstall('htop') // only for test software already uninstalled
      installed = await ssh.isInstalled('htop')
      expect(installed).toStrictEqual(false)

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
  }, 10000)
})
