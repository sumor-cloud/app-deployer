import { NodeSSH } from 'node-ssh'

export default class SSH {
  constructor (config) {
    this.config = config
  }

  async connect () {
    if (!this.connection) {
      this.connection = new NodeSSH()
      try {
        await this.connection.connect(this.config)
      } catch (e) {
        throw new Error('服务器SSH连接失败')
      }
    }
  }

  async disconnect () {
    if (this.connection) {
      this.connection.dispose()
      delete this.connection
    }
  }

  async exec (cmd, options) {
    await this.connect()
    options = options || {}
    options.cwd = options.cwd || '~'
    const result = await this.connection.execCommand(cmd, options)
    if (result.code === 0) {
      return result.stdout
    }
    throw new Error(result.stderr)
  }

  async isInstalled (software) {
    let installed = true
    try {
      await this.exec(`dpkg -s ${software}`)
    } catch (e) {
      installed = false
    }
    return installed
  }

  async install (software) {
    if (!await this.isInstalled(software)) {
      try {
        await this.connection.exec('apt-get update')
        await this.connection.exec(`apt-get install ${software} -y`)
      } catch (e) {
        throw new Error(`服务器软件安装失败:${e.message}`)
      }
    }
  }

  async uninstall (software) {
    if (await this.isInstalled(software)) {
      try {
        await this.exec(`apt-get --purge remove ${software} -y`)
      } catch (e) {
        throw new Error(`服务器软件卸载失败:${e.message}`)
      }
    }
  }

  addTool (name, tool) {
    this[name] = tool(this)
  }
}
