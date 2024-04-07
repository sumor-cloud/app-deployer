// port number prefix is 112

import {
  describe, expect, it
} from '@jest/globals'

import SSH from '../../../src/ssh/SSH.js'
import lock from '../../../src/ssh/tools/lock.js'
import file from '../../../src/ssh/tools/file.js'
import server from '../../server.js'

describe('SSH lock tool', () => {
  const lockRoot = '/usr/sumor/lock'
  const name = 'test-lock'
  const lockPath = `${lockRoot}/${name}.lock`

  it('lock', async () => {
    const ssh = new SSH(server)
    await ssh.connect()

    try {
      const lockTool = lock(ssh)
      const fileTool = file(ssh)

      const lockInstance = await lockTool.lock(name)
      expect(await fileTool.exists(lockPath)).toBe(true)

      await lockInstance.release()
      expect(await fileTool.exists(lockPath)).toBe(false)

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
  })

  it('wait lock', async () => {
    let result = ''

    const ssh = new SSH(server)
    await ssh.connect()

    try {
      const lockTool = lock(ssh)
      const thread1 = async () => {
        result += '1'
        const lockInstance = await lockTool.lock(name)
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, 1000)
        })
        result += '2'
        await lockInstance.release()
      }
      const thread2 = async () => {
        result += '3'
        const lockInstance = await lockTool.lock(name)
        result += '4'
        await lockInstance.release()
      }
      thread1()
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
      thread2()
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 3000)
      })
      expect(result).toBe('1324')

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
  })
})
