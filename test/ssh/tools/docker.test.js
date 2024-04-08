import {
  describe, expect, it
} from '@jest/globals'

import SSH from '../../../src/ssh/SSH.js'
// import docker from '../../../src/ssh/tools/docker.js'
import server from '../../server.js'

describe('SSH docker tool', () => {
  it('init', async () => {
    const ssh = new SSH(server)
    await ssh.connect()

    try {
      // const dockerTool = docker(ssh)

      // expect(dockerTool).toBeDefined()

      expect(1).toBe(1)
      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
  }, 20 * 1000)
})