// 格式化时间为yyyy-mm-dd hh:mm:ss， 自动补零
export default (time) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = `0${date.getMonth() + 1}`.slice(-2)
  const day = `0${date.getDate()}`.slice(-2)
  const hour = `0${date.getHours()}`.slice(-2)
  const minute = `0${date.getMinutes()}`.slice(-2)
  const second = `0${date.getSeconds()}`.slice(-2)
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
