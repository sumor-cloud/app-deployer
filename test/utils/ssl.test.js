// port number prefix is 111

import {
  describe, expect, it
} from '@jest/globals'

import selfsigned from 'selfsigned'
import checkSSL from '../../src/utils/ssl/checkSSL.js'
import hostSSL from '../../src/utils/ssl/hostSSL.js'
import parseUrl from '../../src/utils/ssl/parseUrl.js'

describe('SSL', () => {
  it('parse URL', async () => {
    const url = parseUrl('https://localhost:11111')
    expect(url.hostname).toStrictEqual('localhost')
    expect(url.port).toStrictEqual(11111)

    const url1 = parseUrl('https://localhost')
    expect(url1.hostname).toStrictEqual('localhost')
    expect(url1.port).toStrictEqual(443)

    const url2 = parseUrl('http://www.sumor.com')
    expect(url2.hostname).toStrictEqual('www.sumor.com')
    expect(url2.port).toStrictEqual(80)
  })
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
  it('check SSL failed', async () => {
    let err = null
    try {
      await checkSSL('https://localhost:11112')
    } catch (error) {
      err = error
    }
    expect(err).not.toBeNull()
  })
})
