import {
  describe, expect, it, beforeAll
} from '@jest/globals'

import stringifyUrl from '../../../src/deploy/version/setup/stringifyUrl.js'
import repo from '../../repo.js'
import clone from '../../../src/deploy/version/setup/index.js'
import fse from 'fs-extra'
import getCurrentBranch from '../../../src/deploy/version/setup/getCurrentBranch.js'
import os from 'os'

describe('Git Tools', () => {
  const root = `${os.tmpdir()}/sumor-deployer-test/git/version/setup`
  beforeAll(async () => {
    await fse.remove(root)
  })
  it('Stringify URL', async () => {
    const info1 = {
      url: 'https://github.com/sumor-cloud/priate-app.git',
      user: 'sumor',
      password: 'password'
    }
    const result1 = stringifyUrl(info1)
    expect(result1).toBe('https://sumor:password@github.com/sumor-cloud/priate-app.git')

    const info2 = {
      url: 'https://github.com/sumor-cloud/priate-app.git',
      user: 'sumor',
      password: 'password',
      token: 'demo-token' // token should be considered first
    }
    const result2 = stringifyUrl(info2)
    expect(result2).toBe('https://demo-token@github.com/sumor-cloud/priate-app.git')

    const info3 = {
      url: 'git@github.com:sumor-cloud/priate-app.git'
    }
    try {
      stringifyUrl(info3)
      expect(false).toBeTruthy() // should not reach here
    } catch (e) {
      expect(e).toBeDefined()
    }

    const info4 = {
      url: 'https://github.com/sumor-cloud/priate-app.git'
    }
    const result4 = stringifyUrl(info4)
    expect(result4).toBe('https://github.com/sumor-cloud/priate-app.git')
  })
  it('Clone', async () => {
    const path1 = `${root}/clone1`
    await clone(path1, repo.version)
    const exists1 = await fse.exists(`${path1}/LICENSE`)
    expect(exists1).toBeTruthy()

    const path2 = `${root}/clone2`
    await clone(path2, repo.private)
    const exists2 = await fse.exists(`${path2}/LICENSE`)
    expect(exists2).toBeTruthy()
  }, 60 * 1000)
  it('Fetch', async () => {
    const path1 = `${root}/clone1`
    await clone(path1, repo.version)
    const exists1 = await fse.exists(`${path1}/LICENSE`)
    expect(exists1).toBeTruthy()
  }, 60 * 1000)
  it('Checkout', async () => {
    const path1 = `${root}/clone1`
    const currentBranch = await getCurrentBranch(path1)
    expect(currentBranch).toBe('main')
    await clone(path1, repo.version, 'v1.x')
    const newBranch = await getCurrentBranch(path1)
    expect(newBranch).toBe('v1.x')
  }, 60 * 1000)
})
