import https from 'https'
export default async params => {
  const options = {
    key: params.key,
    cert: params.cert
  }
  return new Promise(resolve => {
    const server = https.createServer(options, (req, res) => {
      res.writeHead(200)
      res.end('Hello, this is an HTTPS server with SSL certificate!\n')
    })

    server.listen(params.port, () => {
      resolve(() => {
        server.close()
      })
    })
  })
}
