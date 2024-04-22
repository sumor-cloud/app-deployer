import YAML from 'yaml'
import fse from 'fs-extra'
import path from 'path'

export default async (root, name) => {
  const ymlPath = `${root}/${name}.yml`
  let result
  try {
    if (await fse.exists(ymlPath)) {
      const data = await fse.readFile(ymlPath, 'utf-8')
      result = YAML.parse(data)
    }
    const yamlPath = `${root}/${name}.yaml`
    if (!result && await fse.exists(yamlPath)) {
      const data = await fse.readFile(yamlPath, 'utf-8')
      result = YAML.parse(data)
    }
    const jsonPath = `${root}/${name}.json`
    if (!result && await fse.exists(jsonPath)) {
      const data = await fse.readFile(jsonPath, 'utf-8')
      result = JSON.parse(data)
    }
  } catch (e) {
    const filePath = path.normalize(path.join(process.cwd(), 'tmp/test', name))
    console.log(`Failed to parse configuration file ${filePath}.yml`)
  }
  return result
}
