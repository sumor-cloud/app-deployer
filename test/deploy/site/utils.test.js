import {
  describe, expect, it
} from '@jest/globals'

import parseInstancesToPorts from '../../../src/deploy/site/utils/parseInstancesToPorts.js'
import type from '../../../src/deploy/site/utils/type.js'

import property from '../../../src/deploy/site/generateConfig/formatter/property.js'
import entity from '../../../src/deploy/site/generateConfig/formatter/entity.js'
import section from '../../../src/deploy/site/generateConfig/formatter/section.js'
import connect from '../../../src/deploy/site/generateConfig/formatter/connect.js'

describe('Route Utils', () => {
  it('Parse instances to ports', async () => {
    // `sumor_app_${app}_${env}_${version}_${port}`
    const instances = [
      'sumor_app_demo_dev_1.0.0_32519',
      'sumor_app_demo_production_1.0.0_32516',
      'sumor_app_demo_production_1.0.0_32517',
      'sumor_app_demo_production_1.0.0_32518',
      'sumor_app_demo_production_1.0.1_32520',
      'sumor_app_portal_production_1.0.1_32521'
    ]

    const app = 'demo'
    const env = 'production'
    const version = '1.0.0'

    const ports = parseInstancesToPorts(instances, app, env, version)

    expect(ports).toEqual([32516, 32517, 32518])
  })
  it('Data type parser', () => {
    expect(type('hello')).toEqual('string')
    expect(type(1)).toEqual('number')
    expect(type(true)).toEqual('boolean')
    expect(type(null)).toEqual('null')
    expect(type(undefined)).toEqual('undefined')
    expect(type([])).toEqual('array')
    expect(type({})).toEqual('object')
    expect(type(/.*/)).toEqual('regexp')
  })
  it('Nginx Formatter', () => {
    const result1 = property('proxy_connect_timeout', '600s')
    expect(result1).toEqual('proxy_connect_timeout 600s;')
    const result2 = property('multi_properties', ['p1', 'p2', 'p3'])
    expect(result2).toEqual('multi_properties p1 p2 p3;')

    const result3 = entity({
      user: 'root',
      worker_processes: 1
    })
    expect(result3).toEqual([
      'user root;',
      'worker_processes 1;'
    ])

    const result4 = section('events', [
      'worker_connections  1024;'
    ])
    expect(result4).toEqual([
      'events {',
      '\tworker_connections  1024;',
      '}'
    ])

    const result5 = connect([
      ['a', 'b'],
      'c'
    ])
    expect(result5).toEqual(['a', 'b', 'c'])
  })
})
