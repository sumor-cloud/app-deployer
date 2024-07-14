import https from 'https'
import parseUrl from './parseUrl.js'

export default sslUrl => {
  return new Promise((resolve, reject) => {
    const sslUrlObject = parseUrl(sslUrl)
    const hostname = sslUrlObject.hostname
    const port = sslUrlObject.port
    const options = {
      hostname,
      port,
      path: '/',
      method: 'GET',
      rejectUnauthorized: false // 禁用证书验证
    }

    const req = https.request(options, res => {
      const cert = res.socket.getPeerCertificate()

      const sslInfo = {
        validFrom: new Date(cert.valid_from).getTime(),
        validTo: new Date(cert.valid_to).getTime(),
        domain: cert.subject.CN
      }

      resolve(sslInfo)
    })

    req.on('error', error => {
      reject(error)
    })

    req.end()
  })
}
