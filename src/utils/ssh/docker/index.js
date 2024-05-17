import dockerCmd from './cmd.js'
export default ssh => ({
  async cmd(cmd, options) {
    return await dockerCmd(ssh, cmd, options)
  },
  async remove(id) {
    try {
      return await this.cmd(`docker rm -f ${id}`)
    } catch (e) {
      if (e.message.indexOf('No such container') < 0) {
        throw e
      }
    }
  },
  async exec(id, cmd, options) {
    options = options || {}
    cmd = JSON.stringify(cmd)
    return await this.cmd(`docker exec ${id} sh -c ${cmd}`, {
      options: { pty: true }
    })
  },
  async images() {
    return await this.cmd('docker images', {
      fields: ['Repository', 'Tag', 'Size']
    })
  },
  async removeImage(app, version) {
    return await this.cmd(`docker image rmi -f ${app}:${version}`)
  },
  async build(app, version, remotePath) {
    return await this.cmd(`docker build -t ${app}:${version} .`, {
      cwd: remotePath
    })
  },
  async instances() {
    const list = await this.cmd('docker ps -a', {
      fields: ['Names', 'CreatedAt', 'Status', 'Ports', 'Size']
    })
    for (const i in list) {
      list[i].instanceId = list[i].Names
      const createAt = list[i].CreatedAt.split(' ')
      createAt.pop()
      list[i].createdTime = new Date(createAt.join(' '))
    }
    return list
  }
})
