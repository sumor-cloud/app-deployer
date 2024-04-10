import axios from 'axios'

export default async (host, port, wait) => {
  const checkStatus = async () => {
    try {
      const res = await axios.get(`http://${host}:${port}`)
      if (res.status === 200) {
        return true
      }
    } catch (e) {
      return false
    }
  }
  if (wait) {
    let status = false
    return await new Promise((resolve, reject) => {
      let costTime = 0
      const timer = setInterval(async () => {
        status = await checkStatus()
        if (status) {
          clearInterval(timer)
          resolve(true)
        } else {
          costTime += 1000
          if (costTime > wait) {
            clearInterval(timer)
            resolve(false)
          }
        }
      }, 1000)
    })
  }
  return await checkStatus()
}
