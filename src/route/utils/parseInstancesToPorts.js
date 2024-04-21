export default (instances, app, env, version) => {
  const prefix = `sumor_app_${app}_${env}_${version}_`
  const ports = []
  for (const instance of instances) {
    if (instance.startsWith(prefix)) {
      let port = instance.split('_').pop()
      port = parseInt(port, 10)
      if (!isNaN(port)) {
        ports.push(port)
      }
    }
  }
  return ports
}
