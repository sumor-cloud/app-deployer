import type from './type.js'

export default (key, value) => {
  if (type(value) === 'array') {
    value = value.join(' ')
  }
  return `${key} ${value};`
}
