import fse from 'fs-extra'

export default async (id) => {
  const rootPath = `${process.cwd()}/tmp/publish/${id}.json`
  if (!await fse.exists(rootPath)) {
    await fse.writeFile(rootPath, '{}')
  }
  const publishedVersion = await fse.readJson(rootPath)

  return {
    data: publishedVersion,
    save: async (key, value) => {
      const data = await fse.readJson(rootPath)
      data[key] = value
      await fse.writeJson(rootPath, data)
    }
  }
}
