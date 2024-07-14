import os from 'os'
export default namespace => {
  return `${os.tmpdir()}/sumor-deployer-test/${namespace}`
}
