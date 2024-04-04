import https from 'https'
import { URL } from 'url'

export default (sslUrl) => {
  return new Promise((resolve, reject) => {
    const sslUrlObject = new URL(sslUrl)
    const hostname = sslUrlObject.hostname
    const port = sslUrlObject.port || 443
    const options = {
      hostname,
      port,
      path: '/',
      method: 'GET',
      rejectUnauthorized: false // 禁用证书验证
    }

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate()

      const sslInfo = {
        validFrom: new Date(cert.valid_from).getTime(),
        validTo: new Date(cert.valid_to).getTime(),
        domain: cert.subject.CN
      }

      resolve(sslInfo)
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.end()
  })
}
