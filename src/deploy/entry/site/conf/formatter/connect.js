import type from './type.js'

export default (items) => {
  const result = []
  for (const i in items) {
    if (type(items[i]) === 'array') {
      for (const j in items[i]) {
        result.push(items[i][j])
      }
    } else {
      result.push(items[i])
    }
  }
  return result
}
