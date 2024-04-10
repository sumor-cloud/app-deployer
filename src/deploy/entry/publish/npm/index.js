import publish from './publish.js'

export default async ({
  name, version, beta, registryInfo, target
}, logger) => {
  target = target || `${process.cwd()}/output/production`
  await publish({
    path: target,
    name,
    version,
    tag: beta ? 'beta' : undefined,
    force: true
  }, registryInfo, logger)
}
