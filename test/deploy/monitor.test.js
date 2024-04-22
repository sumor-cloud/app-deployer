import {
  describe, expect, it
} from '@jest/globals'

import testConfig from '../assets/config.js'
import monitorSystem from '../../src/deploy/monitor/system.js'
import formatTime from '../../src/deploy/monitor/formatTime.js'
import formatSize from '../../src/deploy/monitor/formatSize.js'
import entry from '../../src/deploy/monitor/index.js'

describe('Monitor', () => {
  it('System Info', async () => {
    const system = await monitorSystem(testConfig.server.main)
    expect(system.cpu.cores).toBeGreaterThanOrEqual(0)
    expect(system.cpu.usage).toBeGreaterThanOrEqual(0)
    expect(system.memory.total).toBeGreaterThanOrEqual(0)
    expect(system.memory.free).toBeGreaterThanOrEqual(0)
    expect(system.memory.cache).toBeGreaterThanOrEqual(0)
    expect(system.disk.total).toBeGreaterThanOrEqual(0)
    expect(system.disk.free).toBeGreaterThanOrEqual(0)
    expect(system.uptime).toBeGreaterThan(0)
  })
  it('Format Time', async () => {
    const UTC0Time = 1713102828681
    const time1 = formatTime(UTC0Time, 0)
    expect(time1).toBe('2024-04-14 13:53:48')
    const time2 = formatTime(UTC0Time, 8)
    expect(time2).toBe('2024-04-14 21:53:48')
    const time3 = formatTime(UTC0Time - new Date().getTimezoneOffset() * 60 * 1000)
    expect(time3).toBe('2024-04-14 13:53:48')
  })
  it('Format Size', async () => {
    expect(formatSize(500)).toBe('500.00MB')
    expect(formatSize(1024)).toBe('1.00GB')
    expect(formatSize(1024 * 1024)).toBe('1.00TB')
    expect(formatSize(1024 * 1024 * 1024)).toBe('1.00PB')
  })
  it('Monitor Entry', async () => {
    const monitor = await entry(testConfig.server.main)
    expect(monitor).toMatch(/CPU/)
  })
})
