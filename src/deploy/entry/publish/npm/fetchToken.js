import axios from 'axios'

export default async ({ registry, username, password }) => {
  if (!username || !password) {
    throw new Error('获取授权失败，NPM登录信息不能为空')
  }
  const tokenUrl = `${registry}/-/user/org.couchdb.user:${username}`
  try {
    const response = await axios.put(tokenUrl, { name: username, password })
    return response.data.token
  } catch (e) {
    throw new Error('获取授权失败，请检查NPM登陆信息')
  }
}
