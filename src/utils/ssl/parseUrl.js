import { URL } from 'url'

export default (url) => {
  const urlObject = new URL(url)
  const hostname = urlObject.hostname
  let port = parseInt(urlObject.port, 10)
  if (isNaN(port)) {
    port = urlObject.protocol === 'https:' ? 443 : 80
  }
  return {
    hostname,
    port
  }
}
