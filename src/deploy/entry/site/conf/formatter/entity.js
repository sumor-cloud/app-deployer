import property from './property.js'

export default (obj) => {
  const result = []
  for (const i in obj) {
    result.push(property(i, obj[i]))
  }
  return result
}
