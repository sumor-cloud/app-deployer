import connect from './connect.js'

export default (name, content) => {
  content = connect(content)
  return connect([
    `${name} {`,
    content.map((obj) => `\t${obj}`),
    '}'
  ])
}
