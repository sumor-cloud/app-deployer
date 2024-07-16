import path from 'path'
import extract from 'extract-zip'

export default async (source, target) => {
  source = path.normalize(source)
  return await new Promise((resolve, reject) => {
    extract(source, { dir: target }, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
