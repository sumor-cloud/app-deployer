import {
  describe, expect, it
} from '@jest/globals'

import generatePassword from '../../src/utils/generatePassword.js'
import type from '../../src/utils/type.js'

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
  it('Data type parser', () => {
    expect(type('hello')).toEqual('string')
    expect(type(1)).toEqual('number')
    expect(type(true)).toEqual('boolean')
    expect(type(null)).toEqual('null')
    expect(type(undefined)).toEqual('undefined')
    expect(type([])).toEqual('array')
    expect(type({})).toEqual('object')
    expect(type(/.*/)).toEqual('regexp')
  })
})
