import formatTime from './formatTime.js'
import formatSize from './formatSize.js'
import monitorSystem from './system.js'

export default async server => {
  const system = await monitorSystem(server)

  return `- CPU：${system.cpu.cores}核，已占用${system.cpu.usage}%
- 内存：共${formatSize(system.memory.total)}，剩余${formatSize(system.memory.free + system.memory.cache)}
- 硬盘：共${formatSize(system.disk.total)}，剩余${formatSize(system.disk.free)}
- 启动时间：${formatTime(system.uptime)}`
}
