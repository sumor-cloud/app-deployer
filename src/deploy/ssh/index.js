import SSH from '@sumor/ssh-tools'
import docker from './tools/docker.js'

export default (config) => {
  const ssh = new SSH(config)

  ssh.addTool('docker', docker)

  return ssh
}
