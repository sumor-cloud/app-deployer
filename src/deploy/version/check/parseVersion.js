export default (tag) => {
  // example: 1.0.0
  const shortVersionNameRule = /^\d+\.\d+\.\d+?$/

  // example: v1.0.0
  const fullVersionNameRule = /^v\d+\.\d+\.\d+?$/

  let result

  if (fullVersionNameRule.test(tag)) {
    result = {
      name: tag,
      code: tag.substring(1)
    }
  } else if (shortVersionNameRule.test(tag)) {
    result = {
      name: tag,
      code: tag
    }
  }

  if (result) {
    const versionNumbers = result.code.split('.')
    result.major = parseInt(versionNumbers[0], 10)
    result.minor = parseInt(versionNumbers[1], 10)
    result.patch = parseInt(versionNumbers[2], 10)
  }

  return result
}
