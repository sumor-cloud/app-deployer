export default (ssh) => ({
  async execCommand (cmd, options) {
    await ssh.install('docker.io')
    return await ssh.exec(cmd, options)
  },
  async remove (id) {
    try {
      await this.execCommand(`docker rm -f ${id}`)
    } catch (e) {
      if (e.message.indexOf('No such container') < 0) {
        throw e
      }
    }
  },
  async delete (id) {
    try {
      await this.execCommand(`docker rm -f ${id}`)
    } catch (e) {
      if (e.message.indexOf('No such container') < 0) {
        throw e
      }
    }
  },
  async run ({ mode, image, name, folder, port }) {
    folder = folder || []
    port = port || []

    const cmd = ['docker', 'run']
    cmd.push('-itd')
    for (const i in folder) {
      cmd.push(`-v ${folder[i].from}:${folder[i].to}${folder[i].readOnly ? ':ro' : ''}`)
    }
    for (const i in port) {
      cmd.push(`-p ${port[i].from}:${port[i].to}`)
    }
    if (name) {
      cmd.push(`--name ${name}`)
    }
    if (image) {
      cmd.push(`-d ${image}`)
    }
    if (mode !== '') {
      cmd.push(mode || '/bin/bash')
    }
    return await this.execCommand(cmd.join(' '))
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
    return await this.execCommand(`docker exec ${type} ${id} sh -c ${cmd}`, { options: { pty: true } })
  },
  async export (id, path) {
    await this.execCommand(`docker export ${id} > ${path}`)
  },
  async ip (instanceId) {
    return await this.execCommand(`docker inspect --format='{{.NetworkSettings.Gateway}}' ${instanceId}`)
  },
  async import ({ path, name, version }) {
    const imageName = `${name}:${version}`
    const imageList = await this.images()
    const existingImage = imageList.filter((obj) => obj.Repository === name && obj.Tag === version)[0]
    if (!existingImage) {
      await this.execCommand(`cat ${path} | docker import - ${imageName}`)
    } else {
      throw new Error(`镜像已存在，如需删除请手工执行命令：docker rmi ${imageName}`)
    }
  },
  async images () {
    return await this._checkInfo('docker images', ['Repository', 'Tag', 'Size'])
  },
  async deleteImage (app, version) {
    await this.execCommand(`docker image rmi -f ${app}:${version}`)
  },
  async build (app, version, remotePath) {
    await this.execCommand(`docker build -t ${app}:${version} .`, { cwd: remotePath })
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
  async instance (instanceId) {
    const instances = await this.instances()
    return instances.filter((obj) => obj.instanceId === instanceId)[0]
  },
  async _checkInfo (cmd, fields) {
    const formatArr = []
    for (const i in fields) {
      formatArr.push(`{{.${fields[i]}}}`)
    }
    const stdout = await this.execCommand(`${cmd} --format "${formatArr.join('|')}"`)
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
