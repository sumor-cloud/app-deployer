// port number prefix is 111

import {
  describe, expect, it
} from '@jest/globals'

import selfsigned from 'selfsigned'
import checkSSL from '../../src/utils/ssl/checkSSL.js'
import hostSSL from '../../src/utils/ssl/hostSSL.js'

describe('SSL', () => {
  it('checkSSLInfo', async () => {
    const domain = 'localhost'
    const port = 11111
    const attrs = [{ name: 'commonName', value: domain }]
    const pems = selfsigned.generate(attrs, { days: 365 })

    const closer = await hostSSL({
      port,
      key: pems.private,
      cert: pems.cert
    })

    const sslInfo = await checkSSL(`https://${domain}:11111`)

    expect(sslInfo.domain).toStrictEqual('localhost')
    expect((Date.now() - sslInfo.validFrom) < 2000).toStrictEqual(true)
    expect((sslInfo.validTo - Date.now()) > 364 * 24 * 60 * 60 * 1000).toStrictEqual(true)
    expect((sslInfo.validTo - Date.now()) < 365 * 24 * 60 * 60 * 1000).toStrictEqual(true)

    closer()
  })
})
