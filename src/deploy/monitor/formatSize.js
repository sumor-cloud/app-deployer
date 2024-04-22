// 格式化大小，基础为MB，自动转换为GB、TB、PB

export default (size) => {
  if (size < 1024) {
    return `${size.toFixed(2)}MB`
  }
  size /= 1024
  if (size < 1024) {
    return `${size.toFixed(2)}GB`
  }
  size /= 1024
  if (size < 1024) {
    return `${size.toFixed(2)}TB`
  }
  size /= 1024
  return `${size.toFixed(2)}PB`
}
