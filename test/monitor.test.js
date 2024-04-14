import {
  describe, expect, it
} from '@jest/globals'

import testConfig from './config.js'
import monitorSystem from '../src/monitor/system.js'
import formatTime from '../src/monitor/formatTime.js'
import formatSize from '../src/monitor/formatSize.js'
import entry from '../src/monitor/index.js'

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
    const time = formatTime(1713102828681)
    expect(time).toBe('2024-04-14 21:53:48')
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
