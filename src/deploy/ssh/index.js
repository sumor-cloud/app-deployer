import SSHBasic from '@sumor/ssh-tools'
import docker from './tools/docker.js'

class SSH extends SSHBasic {
  constructor (config) {
    super(config)
    this.addTool('docker', docker)
  }
}

export default SSH
// export default (config) => {
//   const ssh = new SSHTools(config)
//
//   ssh.addTool('docker', docker)
//
//   return ssh
// }
