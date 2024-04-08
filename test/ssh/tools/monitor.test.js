import {
  describe, expect, it
} from '@jest/globals'

import SSH from '../../../src/ssh/SSH.js'
import monitor from '../../../src/ssh/tools/monitor.js'
import server from '../../server.js'

describe('SSH monitor tool', () => {
  it('monitor', async () => {
    const ssh = new SSH(server)
    await ssh.connect()

    try {
      const monitorTool = monitor(ssh)
      const systemInfo = await monitorTool.system()
      expect(systemInfo.disk).not.toBeNull()
      expect(systemInfo.memory).not.toBeNull()
      expect(systemInfo.cpu).not.toBeNull()

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
  }, 20 * 1000)
})
