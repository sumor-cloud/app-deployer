import {
  describe, expect, it
} from '@jest/globals'

import stringifyUrl from '../../../src/deploy/version/git/setup/stringifyUrl.js'

describe('Git Tools', () => {
  it('Stringify URL', async () => {
    const info1 = {
      url: 'https://github.com/sumor-cloud/demo-app.git',
      user: 'sumor',
      password: 'password'
    }

    const result1 = stringifyUrl(info1)
    expect(result1).toBe('https://sumor:password@github.com/sumor-cloud/demo-app.git')

    const info2 = {
      url: 'https://github.com/sumor-cloud/demo-app.git',
      user: 'sumor',
      password: 'password',
      token: 'demo-token' // token should be considered first
    }

    const result2 = stringifyUrl(info2)
    expect(result2).toBe('https://demo-token@github.com/sumor-cloud/demo-app.git')

    const info3 = {
      url: 'git@github.com:sumor-cloud/demo-app.git'
    }

    try {
      stringifyUrl(info3)
      expect(false).toBeTruthy() // should not reach here
    } catch (e) {
      expect(e).toBeDefined()
    }
  })
  it('Clone', async () => {

  })
})
