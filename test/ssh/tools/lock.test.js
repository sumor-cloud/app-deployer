// port number prefix is 112

import {
  describe, expect, it
} from '@jest/globals'

import SSH from '../../../src/ssh/SSH.js'
import lock from '../../../src/ssh/tools/lock.js'
import file from '../../../src/ssh/tools/file.js'
import server from '../../server.js'
import delay from '../../../src/utils/delay.js'

const randomId = () => {
  return Math.random().toString(36).substr(2)
}

describe('SSH lock tool', () => {
  const lockRoot = '/usr/sumor/lock'
  const name = `test-lock-${randomId()}`
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
  }, 20 * 1000)

  it('wait lock', async () => {
    // thread 1: print 1 -> lock -> wait 1s -> print 2 -> release
    // thread 2: wait 0.5s -> print 3 -> wait lock -> print 4 -> release

    let result = ''

    const ssh = new SSH(server)
    await ssh.connect()

    try {
      const lockTool = lock(ssh)
      let locked = false
      let finishedThreadCount = 0
      const thread1 = async () => {
        result += '1'
        const lockInstance = await lockTool.lock(name)
        locked = true
        await delay(1000)
        result += '2'
        await lockInstance.release()
        finishedThreadCount++
      }
      const thread2 = async () => {
        result += '3'
        await new Promise((resolve, reject) => {
          const interval = setInterval(() => {
            if (locked) {
              clearInterval(interval)
              resolve()
            }
          }, 100)
        })
        const lockInstance = await lockTool.lock(name)
        result += '4'
        await lockInstance.release()
        finishedThreadCount++
      }
      thread1()
      await delay(500)
      thread2()

      const lockStatus = await lockTool.check(name)
      expect(lockStatus).toBe(true)

      await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (finishedThreadCount === 2) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })
      expect(result).toBe('1324')

      await ssh.disconnect()
    } catch (e) {
      await ssh.disconnect()
      throw e
    }
  }, 20 * 1000)
})
