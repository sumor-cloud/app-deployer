import fse from 'fs-extra'
import fetchToken from './fetchToken.js'
import getNpmrc from './getNpmrc.js'
import publishNpm from './publishNpm.js'

/*
*
* 发布构建后的NPM包到Registry，并指定版本
*
* */
export default async ({
  path, name, version, force, tag
}, env, logger) => {
  const { username, password, registry } = env

  if (!await fse.exists(`${path}/package.json`)) {
    await fse.writeJson(`${path}/package.json`, {})
  }
  const pkg = await fse.readJson(`${path}/package.json`)
  pkg.version = version || pkg.version
  pkg.name = name || pkg.name

  logger.debug(`正在更新包信息${version}`)
  await fse.writeJson(`${path}/package.json`, pkg)

  logger.debug('正在获取NPM仓库授权')
  const auth = Buffer.from(`${username}:${password}`).toString('base64')
  const token = await fetchToken({ registry, username, password })
  const npmrc = getNpmrc({
    registry, auth, token
  })
  logger.debug(`正在发布版本${version}`)
  await publishNpm({
    registry, target: path, npmrc, force, tag
  }, logger)
}
