// 格式化时间为yyyy-mm-dd hh:mm:ss， 自动补零
export default (time, offset) => {
  if (offset === undefined) {
    offset = new Date().getTimezoneOffset() / 60
  }
  time = time + offset * 60 * 60 * 1000
  const date = new Date(time)
  const year = date.getUTCFullYear()
  const month = `0${date.getUTCMonth() + 1}`.slice(-2)
  const day = `0${date.getUTCDate()}`.slice(-2)
  const hour = `0${date.getUTCHours()}`.slice(-2)
  const minute = `0${date.getUTCMinutes()}`.slice(-2)
  const second = `0${date.getUTCSeconds()}`.slice(-2)
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
