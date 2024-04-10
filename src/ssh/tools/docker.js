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
  async run ({
    mode, image, name, folder, port
  }) {
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
  async buildNode (app, version, localPath) {
    const dockerfile = `FROM node:18.15.0

# 创建/usr/runtime目录
RUN mkdir -p /usr/runtime
RUN mkdir -p /usr/ssl

# 初始化源代码目录
WORKDIR /usr/source
COPY ./source /usr/source
RUN npm install

CMD ["npm", "start"]`
    const root = `/tmp/sumor-deployer-version/${app}_${version}`
    const sourcePath = `${root}/source`
    await ssh.file.ensureDir(sourcePath)
    await ssh.file.putFolder(localPath, sourcePath)
    if (!await ssh.file.exists(`${sourcePath}/.npmrc`)) {
      const npmrc = `registry=https://registry.npmmirror.com
sass_binary_site=https://registry.npmmirror.com/mirrors/node-sass/
sharp_binary_host=https://registry.npmmirror.com/mirrors/sharp
sharp_libvips_binary_host=https://registry.npmmirror.com/mirrors/sharp-libvips
electron_mirror=https://registry.npmmirror.com/mirrors/electron/
puppeteer_download_host=https://registry.npmmirror.com/mirrors/
phantomjs_cdnurl=https://registry.npmmirror.com/mirrors/phantomjs/
sentrycli_cdnurl=https://registry.npmmirror.com/mirrors/sentry-cli/
sqlite3_binary_site=https://registry.npmmirror.com/mirrors/sqlite3/
python_mirror=https://registry.npmmirror.com/mirrors/python/`

      await ssh.file.writeFile(`${sourcePath}/.npmrc`, npmrc)
    }
    await ssh.file.writeFile(`${root}/Dockerfile`, dockerfile)
    const logs = await this.execCommand(`docker build -t ${app}:${version} .`, { cwd: root })
    console.log(logs)
    await ssh.file.remove(root)
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
