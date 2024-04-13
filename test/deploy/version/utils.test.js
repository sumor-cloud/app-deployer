import {
  describe, expect, it
} from '@jest/globals'
import parseVersion from '../../../src/deploy/version/utils/parseVersion.js'
describe('Version Tools', () => {
  it('Parse Version Failed', async () => {
    const tag = 'other'
    const version = parseVersion(tag)
    expect(version).toBeUndefined()
  })
  it('Parse Version 1.0.0', async () => {
    const tag = '1.0.0'
    const version = parseVersion(tag)
    expect(version.name).toBe('1.0.0')
    expect(version.code).toBe('1.0.0')
    expect(version.major).toBe(1)
    expect(version.minor).toBe(0)
    expect(version.patch).toBe(0)
  })
  it('Parse Version v1.0.1', async () => {
    const tag = 'v1.0.1'
    const version = parseVersion(tag)
    expect(version.name).toBe('v1.0.1')
    expect(version.code).toBe('1.0.1')
    expect(version.major).toBe(1)
    expect(version.minor).toBe(0)
    expect(version.patch).toBe(1)
  })
})
