export default (root) => {
  const pathArr = root.split('/')
  const name = pathArr.pop()
  const folder = pathArr.join('/')
  return {
    name,
    folder
  }
}
