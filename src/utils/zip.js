import fse from 'fs-extra'
import archiver from 'archiver'

export default (source, target, ignore) => {
  return new Promise((resolve, reject) => {
    const output = fse.createWriteStream(target)
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    })
    // listen for all archive data to be written
    output.on('close', () => {
      resolve()
    })
    archive.pipe(output)
    archive.glob('**', {
      cwd: source,
      dot: true,
      // root:sourceFolder
      ignore: ignore || [] // ["*.git*"]
    })
    archive.finalize()
  })
}
