export default (ssh) => ({
  async cmd (cmd, options) {
    await ssh.install('docker.io')
    return await ssh.exec(cmd, options)
  },
  async remove (id) {
    try {
      return await this.cmd(`docker rm -f ${id}`)
    } catch (e) {
      if (e.message.indexOf('No such container') < 0) {
        throw e
      }
    }
  },
  async exec (id, cmd, options) {
    options = options || {}
    cmd = JSON.stringify(cmd)
    let type = ''
    if (options.interaction) {
      type = '-it'
    } else if (options.background) {
      type = '-itd'
    }
    return await this.cmd(`docker exec ${type} ${id} sh -c ${cmd}`, {
      cwd: options.cwd || '/',
      options: { pty: true }
    })
  },
  async images () {
    return await this._checkInfo('docker images', ['Repository', 'Tag', 'Size'])
  },
  async removeImage (app, version) {
    return await this.cmd(`docker image rmi -f ${app}:${version}`)
  },
  async build (app, version, remotePath) {
    return await this.cmd(`docker build -t ${app}:${version} .`, { cwd: remotePath })
  },
  async instances () {
    const list = await this._checkInfo('docker ps -a', ['Names', 'CreatedAt', 'Status', 'Ports', 'Size'])
    for (const i in list) {
      list[i].instanceId = list[i].Names
      const createAt = list[i].CreatedAt.split(' ')
      createAt.pop()
      list[i].createdTime = new Date(createAt.join(' '))
    }
    return list
  },
  async _checkInfo (cmd, fields) {
    const formatArr = []
    for (const i in fields) {
      formatArr.push(`{{.${fields[i]}}}`)
    }
    const stdout = await this.cmd(`${cmd} --format "${formatArr.join('|')}"`)
    const result = []
    if (stdout !== '') {
      const item = stdout.split('\n')
      for (const i in item) {
        const fieldValues = item[i].split('|')
        const obj = {}
        for (let j = 0; j < fields.length; j++) {
          obj[fields[j]] = fieldValues[j]
        }
        result.push(obj)
      }
    }
    return result
  }
})
