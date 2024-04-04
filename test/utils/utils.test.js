// port number prefix is 111

import {
  describe, expect, it
} from '@jest/globals'

import generatePassword from '../../src/utils/generatePassword.js'

describe('Utils', () => {
  it('generate password', async () => {
    const password = generatePassword()
    expect(password.length).toStrictEqual(12)
    console.log(password)

    const password1 = generatePassword(12)
    expect(password1.length).toStrictEqual(12)

    const password2 = generatePassword(24)
    expect(password2.length).toStrictEqual(24)
  })
})
