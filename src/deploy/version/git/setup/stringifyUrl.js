export default (options) => {
  const {
    url,
    user,
    password,
    token
  } = options || {}

  const urlArr = url.split('/')

  if (url.indexOf('http') === 0) {
    const protocol = urlArr.shift()
    urlArr.shift() // remove empty string
    const suffixUrl = urlArr.join('/')
    if (token) {
      return `${protocol}//${token}@${suffixUrl}`
    } else {
      return `${protocol}//${user}:${password}@${suffixUrl}`
    }
  } else {
    throw new Error('Invalid URL, only http/https is supported.')
  }
}
