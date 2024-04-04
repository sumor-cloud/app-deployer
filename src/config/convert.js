import YAML from 'yaml'
import fse from 'fs-extra'
import load from './load'

export default async (root, name, type) => {
  const config = await load(root, name)
  await fse.remove(`${root}/${name}.yml`)
  await fse.remove(`${root}/${name}.yaml`)
  await fse.remove(`${root}/${name}.json`)
  if (type === 'json') {
    await fse.writeFile(`${root}/${name}.json`, JSON.stringify(config, null, 4))
  } else {
    await fse.writeFile(`${root}/${name}.yml`, YAML.stringify(config))
  }
}
