export default async (ssh, options) => {
  options = options || {}
  const dockerfile =
`FROM node:18.15.0

# 创建/usr/runtime目录
RUN mkdir -p /usr/runtime
RUN mkdir -p /usr/ssl

# 初始化源代码目录
WORKDIR /usr/source
COPY ./source /usr/source
RUN npm install

CMD ["npm", "start"]`
  const root = `/tmp/sumor-deployer-version/${options.app}_${options.version}`
  const sourcePath = `${root}/source`
  await ssh.file.ensureDir(sourcePath)
  await ssh.file.putFolder(options.source, sourcePath)
  await ssh.file.writeFile(`${root}/Dockerfile`, dockerfile)
  const logs = await ssh.docker.build(options.app, options.version, root)
  console.log(logs)
  await ssh.file.remove(root)
  return logs
}
