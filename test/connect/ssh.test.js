import {
  describe, expect, it
} from '@jest/globals'

import SSH from '../../src/connect/SSH.js'
import fs from 'fs'

let server = fs.readFileSync(`${process.cwd()}/test/config/server.json`, 'utf-8')
server = JSON.parse(server)

describe('SSH', () => {
  it('connect', async () => {
    const ssh = new SSH(server)
    await ssh.connect()

    try {
      // Test command execution
      const result = await ssh.exec('echo "OK"')
      expect(result).toStrictEqual('OK')

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
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
      installed = await ssh.isInstalled('htop')
      expect(installed).toStrictEqual(true)

      // Test software uninstallation
      await ssh.uninstall('htop')
      installed = await ssh.isInstalled('htop')
      expect(installed).toStrictEqual(false)

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
    }
  })
})
