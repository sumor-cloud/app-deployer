export default options => {
  let { url, user, username, password, token } = options || {}

  user = user || username

  const urlArr = url.split('/')

  if (url.indexOf('http') === 0) {
    const protocol = urlArr.shift()
    urlArr.shift() // remove empty string
    const suffixUrl = urlArr.join('/')
    if (token) {
      return `${protocol}//${token}@${suffixUrl}`
    } else if (user && password) {
      return `${protocol}//${user}:${password}@${suffixUrl}`
    } else {
      return url
    }
  } else {
    throw new Error('Invalid URL, only http/https is supported.')
  }
}
