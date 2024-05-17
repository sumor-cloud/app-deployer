import live from './live.js'

export default config => {
  const result = { ...config }

  result.live = live(config)

  return result
}
