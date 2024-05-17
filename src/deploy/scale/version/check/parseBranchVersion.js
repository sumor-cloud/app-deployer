export default branch => {
  branch = branch.replace('remotes/origin/', '')

  const result = {}

  // priority v1.0 > v1.x = v1 > other
  // v1.0 is 3
  // v1.x is 2
  // v1 is 2
  // other is 1

  // rule for v1.x
  const rule1 = /^v\d+\.x$/

  // rule for v1.0
  const rule2 = /^v\d+\.\d+?$/

  // rule for v1
  const rule3 = /^v\d+$/

  // rule for 1.x
  const rule4 = /^\d+\.x$/

  // rule for 1.0
  const rule5 = /^\d+\.\d+?$/

  // rule for 1
  const rule6 = /^\d+?$/

  if (rule1.test(branch)) {
    const arr = branch.replace('v', '').split('.')
    result.major = parseInt(arr[0])
    result.priority = 2
  } else if (rule2.test(branch)) {
    const arr = branch.replace('v', '').split('.')
    result.major = parseInt(arr[0])
    result.minor = parseInt(arr[1])
    result.priority = 3
  } else if (rule3.test(branch)) {
    result.major = parseInt(branch.replace('v', ''))
    result.priority = 2
  } else if (rule4.test(branch)) {
    const arr = branch.split('.')
    result.major = parseInt(arr[0])
    result.priority = 2
  } else if (rule5.test(branch)) {
    const arr = branch.split('.')
    result.major = parseInt(arr[0])
    result.minor = parseInt(arr[1])
    result.priority = 3
  } else if (rule6.test(branch)) {
    result.major = parseInt(branch)
    result.priority = 2
  } else if (branch === 'master' || branch === 'main' || branch === 'develop' || branch === 'dev') {
    result.priority = 1
  }

  return result
}
