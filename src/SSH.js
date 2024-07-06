import SSHBasic from '@sumor/ssh-tools'
import docker from '@sumor/ssh-docker'

class SSH extends SSHBasic {
  constructor(config) {
    super(config)
    this.addTool('docker', docker)
  }
}

export default SSH
