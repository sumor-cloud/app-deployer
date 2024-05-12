import SSH from '../../../utils/ssh/index.js'
import pages from './pages.js'

export default async (server, nginxConfig) => {
  const ssh = new SSH(server)
  const sitePath = '/usr/sumor-cloud/nginx'
  await ssh.file.ensureDir(sitePath)
  await ssh.file.ensureDir(`${sitePath}/pages`)
  await ssh.file.writeFile(`${sitePath}/nginx.conf`, nginxConfig)
  const { noInstancePage } = pages()
  await ssh.file.writeFile(`${sitePath}/pages/no_instance.html`, noInstancePage)

  const instanceId = 'sumor_site'

  await ssh.docker.remove(instanceId)

  // 确保站点存在
  const dockerInstances = await ssh.docker.instances()
  const dockerInstance = dockerInstances.filter((obj) => obj.instanceId === instanceId)[0]
  if (!dockerInstance) {
    const sslPath = '/usr/sumor-cloud/ssl'
    await ssh.file.ensureDir(sslPath)

    // console.log('正在站点实例初始化')
    const runConfig = [
      'docker run -itd --restart=on-failure',
            `-v ${sitePath}/nginx.conf:/etc/nginx/nginx.conf`,
            `-v ${sitePath}/pages:/etc/nginx/pages`,
            `-v ${sslPath}:/etc/nginx/ssl:ro`,
            '-v /tmp/sumor-cloud/site:/tmp',
            '-v /tmp/sumor-cloud/site-nginx:/var/log/nginx'
    ]
    runConfig.push('-p 443:443 -p 80:80')
    runConfig.push(`--name ${instanceId}`)
    runConfig.push('-d nginx')
    await ssh.docker.cmd(runConfig.join(' '))

    console.log('站点实例已更新')
  }

  // try {
  //   await ssh.docker.cmd(`docker stop ${instanceId}`)
  // }catch (e){
  //   console.log(e)
  // }
  // try {
  //   await ssh.docker.cmd(`docker start ${instanceId}`)
  // }catch (e){
  //   console.log(e)
  // }
  // try {
  //   await ssh.docker.exec(instanceId, 'nginx -s stop')
  //   await ssh.docker.exec(instanceId, 'nginx -c /etc/nginx/nginx.conf')
  // }catch (e){
  //   console.log(e)
  // }

  await ssh.disconnect()
}
