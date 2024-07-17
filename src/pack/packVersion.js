import clone from './setup/index.js'
import fse from 'fs-extra'

import getTmpDir from '../utils/getTmpDir.js'
import zip from '../utils/zip.js'

export default async (git, versionId, target) => {
  const existsVersionFile = await fse.exists(target)
  if (!existsVersionFile) {
    await fse.ensureFile(target)
    const tmpPath = await getTmpDir()
    try {
      await clone(git, tmpPath, versionId)
      await zip(tmpPath, target, ['.git/**', '*.git*'])
    } finally {
      await fse.remove(tmpPath)
    }
  }
}
