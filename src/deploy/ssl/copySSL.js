import SSH from '../../SSH.js'
import fse from 'fs-extra'
import os from 'os'
import selfsigned from 'selfsigned'

export default async (server, domain) => {
  let localPath = `${process.cwd()}/assets/ssl/${domain}`
  const remotePath = `/usr/sumor-cloud/ssl/${domain}`
  const ssh = new SSH(server)
  if (!(await fse.exists(localPath))) {
    localPath = `${os.homedir()}/sumor-cloud-deployer/ssl/${domain}`
    await fse.ensureDir(localPath)

    const attrs = [{ name: 'commonName', value: domain }]
    const pems = selfsigned.generate(attrs, { days: 36500 })

    await fse.writeFile(`${localPath}/domain.cer`, pems.cert)
    await fse.writeFile(`${localPath}/domain.key`, pems.private)
  }
  await ssh.file.putFolder(localPath, remotePath)
  await ssh.disconnect()
}
