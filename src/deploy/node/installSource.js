import fse from 'fs-extra'

const defaultNpmrc = `@sumor-cloud:registry=http://npm.sumor.com
registry=https://registry.npmmirror.com
package-lock=false

sass_binary_site=https://registry.npmmirror.com/mirrors/node-sass/
sharp_binary_host=https://registry.npmmirror.com/mirrors/sharp
sharp_libvips_binary_host=https://registry.npmmirror.com/mirrors/sharp-libvips
electron_mirror=https://registry.npmmirror.com/mirrors/electron/
puppeteer_download_host=https://registry.npmmirror.com/mirrors/
phantomjs_cdnurl=https://registry.npmmirror.com/mirrors/phantomjs/
sentrycli_cdnurl=https://registry.npmmirror.com/mirrors/sentry-cli/
sqlite3_binary_site=https://registry.npmmirror.com/mirrors/sqlite3/
python_mirror=https://registry.npmmirror.com/mirrors/python/`

export default async (ssh, { tmp, env, version }, logger, force) => {
  const remote = `/usr/sumor/apps/${env}/${version}`

  if (force) {
    await ssh.file.delete(remote)
    logger.trace('已强制清除该版本代码缓存')
  }

  if (!await ssh.file.exists(remote)) {
    logger.trace('服务器未部署代码，开始上传')
    await ssh.file.ensureDir(remote)
    await ssh.file.putFolder(tmp, remote)

    let npmrc = defaultNpmrc
    if (await fse.exists(`${tmp}/.npmrc`)) {
      npmrc = await fse.readFile(`${tmp}/.npmrc`, 'utf-8')
    }
    // npmrc = `@${scope}:registry=${npmUrl}\n${npmrcDefault}\n${npmrc}`;
    await ssh.file.writeFile(`${remote}/.npmrc`, npmrc)

    logger.trace('服务器部署代码完成')
  } else {
    logger.trace('服务器已部署代码')
  }

  if (!await ssh.file.exists(`${remote}/node_modules`)) {
    logger.trace('服务器开始安装依赖')
    const installerId = `sumor_installer_${env}_${version}`
    await ssh.docker.delete(installerId)
    await ssh.docker.run({
      image: 'node',
      name: installerId,
      folder: [
        { from: remote, to: '/usr/sumor/source' }
      ]
    })
    const log = await ssh.docker.exec(installerId, 'cd /usr/sumor/source;npm i')
    logger.trace(log)
    await ssh.docker.delete(installerId)
    logger.trace('服务器安装依赖完成')
  } else {
    logger.trace('服务器已安装依赖')
  }
}
