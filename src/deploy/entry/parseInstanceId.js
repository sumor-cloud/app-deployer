export default (str) => {
  const strArr = str.split('_')
  strArr.shift()
  const type = strArr.shift()
  const app = strArr.shift()
  const env = strArr.shift()
  let port; let version; let
    action
  if (strArr.length > 1) {
    version = strArr.shift()
    port = parseInt(strArr.shift())
  } else {
    action = strArr.shift()
  }
  const result = {
    type,
    app,
    env,
    port,
    version,
    action
  }
  for (const i in result) {
    if (!result[i]) {
      delete result[i]
    }
  }
  return result
}
