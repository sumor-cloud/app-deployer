import fse from 'fs-extra'
import cmd from '../../utils/cmd.js'
import SSH from '../ssh/index.js'
import clone from '../version/setup/index.js'

// const checkDockerStatus = async (ssh, host, port, wait) => {
//   const checkStatus = async () => {
//     try {
//       const res = await ssh.docker.execCommand(`https://${host}:${port}`);
//       console.log(res);
//       if (res.status === 200) {
//         return true;
//       }
//     } catch (e) {
//       return false;
//     }
//   };
//   if (wait) {
//     let status = false;
//     return await new Promise((resolve, reject) => {
//       let costTime = 0;
//       const timer = setInterval(async () => {
//         status = await checkStatus();
//         if (status) {
//           clearInterval(timer);
//           resolve(true);
//         } else {
//           costTime += 1000;
//           if (costTime > wait) {
//             clearInterval(timer);
//             resolve(false);
//           }
//         }
//       }, 1000);
//     });
//   } else {
//     return await checkStatus();
//   }
// };

export default async ({
  server, app, env, git, version, domain
}) => {
  const ssh = SSH(server)

  const checkExists = async () => {
    const images = await ssh.docker.images()
    const image = images.find((image) => image.Repository === app && image.Tag === version.name)
    return !!image
  }
  const existsImage = await checkExists()
  if (!existsImage) {
    console.log('开始构建代码')
    const buildPath = `${process.cwd()}/tmp/build/${app}/${version.name}`
    if (!await fse.exists(buildPath)) {
      console.log(`正在构建源代码到${buildPath}`)
      await fse.ensureDir(`${process.cwd()}/tmp/build`)
      try {
        await clone(buildPath, git, version.id)
        await cmd('npm i', { cwd: buildPath })
        await cmd('npm run build', { cwd: buildPath })
        await fse.remove(`${buildPath}/web`)
        await fse.remove(`${buildPath}/node_modules`)
        await fse.remove(`${buildPath}/tmp`)
      } catch (e) {
        console.log(e)
      }
    }
    console.log('代码构建完成')
    console.log(`正在构建版本${version.name}镜像`)
    await ssh.docker.buildNode(app, version.name, buildPath)
    console.log('构建版本镜像完成')
  }

  console.log('部署容器实例')
  const deployPath = `${process.cwd()}/tmp/env/${app}/${env}`
  console.log(`正在配置环境相关代码到${deployPath}`)
  const envPath = `${process.cwd()}/assets/${app}/${env}`
  if (await fse.exists(envPath)) {
    await fse.copy(envPath, deployPath)
  }
  const port = await ssh.port.getPort()

  const instanceInfo = {
    app,
    env,
    version: version.name,
    server: server.name,
    port,
    upTime: Date.now(),
    versionTime: version.committerDate
  }
  const remoteEnv = `/usr/sumor-cloud/env/${app}_${env}`
  await ssh.file.putFolder(deployPath, remoteEnv)
  await fse.remove(deployPath)

  const remoteInstance = `/usr/sumor-cloud/instance/${app}_${env}/${Date.now()}.json`
  await ssh.file.writeFile(remoteInstance, JSON.stringify(instanceInfo, null, 4))

  const dockerId = `sumor_app_${app}_${env}_${version.name}_${port}`
  console.log(`正在部署实例到容器${dockerId}`)
  await ssh.docker.execCommand(`docker run -itd --restart=on-failure -v ${remoteInstance}:/usr/source/instance.json:ro -v ${remoteEnv}:/usr/source/config:ro -v /usr/sumor-cloud/ssl/${domain}:/usr/source/ssl:ro -p ${port}:443 --name ${dockerId} -d ${app}:${version.name}`)

  // const status = await checkDockerStatus(ssh, serverConfig.iHost || serverConfig.host, port, 10 * 1000);
  await ssh.disconnect()
  // if (!status) {
  //   throw new Error(`容器启动失败`);
  // }

  return dockerId
}
