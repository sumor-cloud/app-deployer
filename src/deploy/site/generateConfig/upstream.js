import section from '../utils/formatter/section.js'

export default (name, items) =>
  section(
    `upstream ${name}_stream`,
    items.map(obj => {
      const result = ['server']
      result.push(obj.url)
      if (obj.down) {
        result.push('down')
      } else if (obj.backup) {
        result.push('backup')
      } else {
        if (obj.weight && !isNaN(obj.weight)) {
          result.push(`weight=${obj.weight}`)
        }
        if (obj.try && !isNaN(obj.try)) {
          result.push(`max_fails=${obj.try}`)
          if (obj.wait && !isNaN(obj.wait)) {
            result.push(`fail_timeout=${obj.wait}s`)
          }
        }
      }

      return `${result.join(' ')};`
    })
  )
