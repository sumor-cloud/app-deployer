import { describe, expect, it, beforeEach, afterEach } from '@jest/globals'
import fse from 'fs-extra'
import format from '../src/config/format.js'
import testConfig from './assets/config.js'
import loadConfig from '../src/config/index.js'
import getTmpDir from './test-utils/getTmpDir.js'

describe('Config', () => {
  const root = getTmpDir('config')
  beforeEach(async () => {
    await fse.remove(root)
    await fse.ensureDir(root)
  })
  afterEach(async () => {
    await fse.remove(root)
  })
  it('获取实例配置', async () => {
    const config = {
      ...testConfig,
      source: {
        demo: {
          url: 'https://github.com/demo/demo.git'
        }
      },
      server: {
        main: {
          host: '1.2.3.4',
          port: 22,
          username: 'root',
          password: 'Abcd1234'
        }
      },
      env: {
        production: {
          demo: {
            domain: 'www.demo.com',
            entry: 'main'
          }
        }
      },
      scale: {
        production: {
          demo: {
            '1.0.0': {
              instance: {
                main: 2
              }
            },
            '1.0.1': {
              live: true,
              instance: {
                main: 4
              }
            }
          }
        }
      }
    }
    config.server.main = {
      host: '1.2.3.4',
      port: 22,
      username: 'root',
      password: 'Abcd1234'
    }
    config.source.demo = {
      url: 'https://github.com/demo/demo.git'
    }
    const scopeConfig = format(config)
    const expectFilePath = `${process.cwd()}/test/assets/expect/configFormatter.json`
    // await fse.writeFile(expectFilePath, JSON.stringify(scopeConfig, null, 4))
    const expectResult = await fse.readJson(expectFilePath)
    expect(scopeConfig).toEqual(expectResult)
  })
  it('Empty config', async () => {
    const scopeConfig = format({
      env: {
        production: {}
      },
      scale: {
        production: {}
      }
    })
    expect(scopeConfig).toEqual({
      env: {
        production: {}
      },
      scale: {
        production: {}
      },
      live: []
    })
  })
  it('Load config', async () => {
    const tmpConfigPath = `${root}/scope.json`
    await fse.writeJson(tmpConfigPath, testConfig)
    const config = await loadConfig(root)
    expect(config.server.main.name).toBe('main')
  })
})
