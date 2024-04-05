import SSH from './SSH.js'
import port from './tools/port.js'
// import file from './file';
// import docker from './docker';
// import monitor from './monitor';
// import node from './node.js';

export default (config) => {
  const ssh = new SSH(config)
  ssh.addTool('port', port)
  // ssh.addTool('file', file);
  // ssh.addTool('docker', docker);
  // ssh.addTool('node', node);
  // ssh.addTool('monitor', monitor);
  return ssh
}
