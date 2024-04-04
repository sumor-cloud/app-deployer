// port number prefix is 111

import {
  describe, expect, it, beforeEach, afterEach
} from '@jest/globals'
import fse from 'fs-extra'
import YAML from 'yaml'
import path from 'path'

import convert from '../src/config/convert.js'
import load from '../src/config/load.js'

describe('Config', () => {
  const root = path.join(process.cwd(), 'tmp/test')
  beforeEach(async () => {
    await fse.remove(root)
    await fse.ensureDir(root)
  })
  afterEach(async () => {
    await fse.remove(root)
  })
  it('load config files', async () => {
    // The loading order should be: yml > yaml > json
    await fse.writeFile(`${root}/config.json`, JSON.stringify({
      type: 'json'
    }))
    const config1 = await load(root, 'config')
    expect(config1.type).toBe('json')

    await fse.writeFile(`${root}/config.yaml`, YAML.stringify({
      type: 'yaml'
    }))
    const config2 = await load(root, 'config')
    expect(config2.type).toBe('yaml')

    await fse.writeFile(`${root}/config.yml`, YAML.stringify({
      type: 'yml'
    }))
    const config3 = await load(root, 'config')
    expect(config3.type).toBe('yml')
  })
  it('加载配置文件', async () => {
    await fse.writeFile(`${root}/config.json`, JSON.stringify({
      type: 'json'
    }))
    await fse.writeFile(`${root}/config.yaml`, JSON.stringify({
      type: 'yaml'
    }))
    await convert(root, 'config', 'json')
    const config1 = await load(root, 'config')
    expect(config1.type).toBe('yaml')
    await convert(root, 'config', 'yml')
    const config2 = await load(root, 'config')
    expect(config2.type).toBe('yaml')
  })
  it('加载配置文件失败', async () => {
    await fse.writeFile(`${root}/dummy.yaml`, '{"type":!@123}')
    const config = await load(root, 'dummy')
    expect(config.type).toBe(undefined)
  })
})
