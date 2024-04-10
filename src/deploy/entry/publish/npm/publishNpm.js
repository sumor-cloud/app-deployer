import fse from 'fs-extra'
import path from 'path'
import cmd from './cmd.js'

export default async ({
  registry, target, npmrc, force, tag
}, logger) => {
  tag = tag || 'latest'
  const npmrcPath = path.normalize(`${target}/.npmrc`).replace(/\\/g, '/')
  await fse.writeFile(npmrcPath, npmrc)
  const pkg = await fse.readJson(`${target}/package.json`)
  const versionName = `${pkg.name}@${pkg.version}`
  try {
    await cmd(`npm publish --allow-same-version --access public --tag ${tag} --registry=${registry} --userconfig=${npmrcPath}`, { cwd: target })

    logger.debug(`NPM包${versionName}已发布 ${target}`)
  } catch (e) {
    let errMessage
    if (typeof e === 'object') { errMessage = e.message }
    if (typeof e === 'string') { errMessage = e }
    if (errMessage && errMessage.indexOf('EPUBLISHCONFLICT') >= 0) {
      if (force) {
        logger.debug(`仓库已存在该版本${versionName}，将删除重新发布`)
        let unpublishFailed = false

        try {
          await cmd(`npm unpublish --registry=${registry} --userconfig=${npmrcPath} ${versionName}`, { cwd: target })
        } catch (e) {
          unpublishFailed = true
        }
        if (!unpublishFailed) {
          await cmd(`npm publish --allow-same-version --access public --tag ${tag} --registry=${registry} --userconfig=${npmrcPath}`, { cwd: target })
        }

        logger.debug(`NPM包${versionName}已发布 ${target}`)
      } else {
        logger.debug('已存在该版本')
      }
    } else {
      logger.debug(e.message)
      logger.debug(e)
      logger.debug('发布失败')
    }
  }

  try {
    await cmd(`npm dist-tag add ${versionName} ${tag} --registry=${registry} --userconfig=${npmrcPath}`, { cwd: target })
  } catch (e) {
    logger.debug(e.message)
    logger.debug(e)
    logger.debug('标签更新失败')
  }
}
