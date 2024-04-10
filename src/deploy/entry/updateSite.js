import parseInstanceId from './parseInstanceId.js'
import conf from './site/conf/index.js'
import pages from './site/pages.js'
import SSH from '../../ssh/index.js'

export default async (scope, scale, instances, force) => {
  const site = {}
  for (const env in scope.env) {
    for (const app in scope.env[env]) {
      const { domain, entry } = scope.env[env][app]
      site[entry] = site[entry] || {}
      site[entry][domain] = []

      const envScale = scale[env] || {}
      const appScale = envScale[app] || {}
      let liveVersion
      for (const version in appScale) {
        const versionScale = appScale[version] || {}
        if (versionScale.live) {
          liveVersion = version
        }
      }

      for (const server in instances) {
        const serverInfo = scope.server[server]
        const serverInstances = instances[server]
          .map((o) => parseInstanceId(o))
          .filter((o) => o.app === app && o.env === env && o.version === liveVersion)
        for (const obj of serverInstances) {
          site[entry][domain].push(`${serverInfo.iHost || serverInfo.host}:${obj.port}`)
        }
      }
    }
  }
  for (const server in site) {
    const ports = [443, 80]
    const apps = []
    for (const domain in site[server]) {
      const app = {
        name: domain.replace('.', '_'),
        port: 443,
        domain,
        instances: site[server][domain].map((url) => ({
          url
        }))
      }
      apps.push(app)
    }

    const nginxConfig = conf(apps)

    const ssh = SSH(scope.server[server])
    const sitePath = '/usr/sumor-cloud/site'
    await ssh.file.ensureDir(sitePath)
    await ssh.file.ensureDir(`${sitePath}/pages`)
    await ssh.file.writeFile(`${sitePath}/nginx.conf`, nginxConfig)
    const { noInstancePage } = pages()
    await ssh.file.writeFile(`${sitePath}/pages/no_instance.html`, noInstancePage)

    const instanceId = 'sumor_site'

    if (force) {
      await ssh.docker.delete(instanceId)
    }

    // 确保站点存在
    const dockerInstances = await ssh.docker.instances()
    const dockerInstance = dockerInstances.filter((obj) => obj.instanceId === instanceId)[0]
    if (!dockerInstance) {
      const sslPath = '/usr/sumor-cloud/ssl'
      await ssh.file.ensureDir(sslPath)

      console.log('正在站点实例初始化')
      await ssh.docker.run({
        image: 'nginx',
        name: instanceId,
        folder: [
          { from: `${sitePath}/nginx.conf`, to: '/etc/nginx/nginx.conf' },
          { from: `${sitePath}/pages`, to: '/etc/nginx/pages' },
          { from: sslPath, to: '/etc/nginx/ssl' },
          { from: '/tmp/sumor-cloud/site', to: '/tmp' },
          { from: '/tmp/sumor-cloud/site-nginx', to: '/var/log/nginx' }
        ],
        port: ports.map((port) => ({ from: port, to: port }))
      })
    }

    await ssh.docker.exec(instanceId, 'nginx -s stop')
    await ssh.docker.exec(instanceId, 'nginx -c /etc/nginx/nginx.conf')
    // await ssh.docker.exec(instanceId, "nginx -s reload");

    await ssh.disconnect()
  }
}
