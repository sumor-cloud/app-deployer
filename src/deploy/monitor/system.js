import SSH from '../ssh/index.js'

// 格式化时间为yyyy-mm-dd hh:mm:ss， 自动补零
const formatTime = (time) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = `0${date.getMonth() + 1}`.slice(-2)
  const day = `0${date.getDate()}`.slice(-2)
  const hour = `0${date.getHours()}`.slice(-2)
  const minute = `0${date.getMinutes()}`.slice(-2)
  const second = `0${date.getSeconds()}`.slice(-2)
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 格式化大小，基础为MB，自动转换为GB、TB、PB
const formatSize = (size) => {
  if (size < 1024) {
    return `${size}MB`
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

export default async (server) => {
  const ssh = SSH(server)
  const system = await ssh.monitor.system()
  await ssh.disconnect()

  return `- CPU：${system.cpu.cores}核，已占用${system.cpu.usage}%
- 内存：共${formatSize(system.memory.total)}，剩余${formatSize(system.memory.free + system.memory.cache)}
- 硬盘：共${formatSize(system.disk.total)}，剩余${formatSize(system.disk.free)}
- 启动时间：${formatTime(system.uptime)}`
}
