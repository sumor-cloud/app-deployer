import SSH from '../../ssh/index.js'
import pages from './pages.js'

export default async (server, nginxConfig, force) => {
  const ssh = new SSH(server)
  const sitePath = '/usr/sumor-cloud/nginx'
  await ssh.file.ensureDir(sitePath)
  await ssh.file.ensureDir(`${sitePath}/pages`)
  await ssh.file.writeFile(`${sitePath}/nginx.conf`, nginxConfig)
  const { noInstancePage } = pages()
  await ssh.file.writeFile(`${sitePath}/pages/no_instance.html`, noInstancePage)

  const instanceId = 'sumor_site'

  if (force) {
    await ssh.docker.remove(instanceId)
  }

  // 确保站点存在
  const dockerInstances = await ssh.docker.instances()
  const dockerInstance = dockerInstances.filter((obj) => obj.instanceId === instanceId)[0]
  if (!dockerInstance) {
    const sslPath = '/usr/sumor-cloud/ssl'
    await ssh.file.ensureDir(sslPath)

    console.log('正在站点实例初始化')
    const runConfig = [
      'docker run -itd --restart=on-failure',
            `-v ${sitePath}/nginx.conf:/etc/nginx/nginx.conf:ro`,
            `-v ${sitePath}/pages:/etc/nginx/pages:ro`,
            `-v ${sslPath}:/etc/nginx/ssl:ro`,
            '-v /tmp/sumor-cloud/nginx:/tmp',
            '-v /tmp/sumor-cloud/nginx/main:/var/log/nginx'
    ]
    runConfig.push('-p 443:443 -p 80:80')
    runConfig.push(`--name ${instanceId}`)
    runConfig.push('-d nginx')
    await ssh.docker.cmd(runConfig.join(' '), {
      cwd: '/'
    })
  }

  await ssh.docker.exec(instanceId, 'nginx -s stop')
  await ssh.docker.exec(instanceId, 'nginx -c /etc/nginx/nginx.conf')
  // await ssh.docker.exec(instanceId, "nginx -s reload");
  // service nginx start

  await ssh.disconnect()
}
