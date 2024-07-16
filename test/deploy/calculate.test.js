import { describe, expect, it } from '@jest/globals'

import config from '../assets/config.js'
import calcInstanceDiff from '../../src/deploy/calc/calcInstanceDiff.js'
import convertScaleVersion from '../../src/deploy/calc/convertScaleVersion.js'
import calcUpdatedSite from '../../src/deploy/calc/calcUpdatedSite.js'

describe('Deploy Calculate', () => {
  it('convert scale version', () => {
    const versions = {
      demo: {
        '0.0.0': {
          id: 'bb56693ff343289c309b491e2e46c8a67783eacc'
        },
        '1.0.0': {
          id: '6cdcbfc7784bdb3cddf09270f5aa853634620c38'
        },
        '1.0.1': {
          id: '63394ad4b154f93051e982b464d920398069922e'
        },
        '1.0.2': {
          id: '63394ad4b154f93051e982b464d920398069922e' // same as 1.0.1
        },
        '1.0.3': {
          id: '6b8a097bed2313ac99a2ceeeb55fe8e37e5a4b1e'
        }
      }
    }
    const scale = {
      production: {
        demo: {
          '1.0.0': {
            instance: {
              main: 2
            }
          },
          '1.0.1': {
            instance: {
              main: 2
            }
          },
          '1.0.2': {
            live: true,
            instance: {
              main: 4
            }
          },
          '1.0.3': {
            live: true, // duplicate live, will use last one
            instance: {
              main: 2
            }
          }
        }
      }
    }
    const newScale = convertScaleVersion(versions, scale)
    expect(newScale).toEqual({
      production: {
        demo: {
          '6cdcbfc7784bdb3cddf09270f5aa853634620c38': {
            versions: ['1.0.0'],
            live: false,
            instance: {
              main: 2
            }
          },
          '63394ad4b154f93051e982b464d920398069922e': {
            versions: ['1.0.1', '1.0.2'],
            live: false,
            instance: {
              main: 4
            }
          },
          '6b8a097bed2313ac99a2ceeeb55fe8e37e5a4b1e': {
            versions: ['1.0.3'],
            live: true,
            instance: {
              main: 2
            }
          }
        }
      }
    })
  })
  it('calc instance difference', () => {
    const serverInstances = {
      main: [
        {
          instanceId: 'sumor_app_demo_production_6cdcbfc_30001',
          createdTime: new Date('2024-01-01T00:00:00.000Z')
        },
        {
          instanceId: 'sumor_app_demo_production_6cdcbfc_30002',
          createdTime: new Date('2024-01-02T00:00:00.000Z')
        },
        {
          instanceId: 'sumor_app_demo_production_6cdcbfc_30003',
          createdTime: new Date('2024-01-03T00:00:00.000Z')
        },
        {
          instanceId: 'sumor_app_demo_production_63394ad_30011',
          createdTime: new Date('2024-01-03T00:00:00.000Z')
        }
      ]
    }
    const scale = {
      production: {
        demo: {
          '6cdcbfc7784bdb3cddf09270f5aa853634620c38': {
            versions: ['1.0.0'],
            live: false,
            instance: {
              main: 2
            }
          },
          '63394ad4b154f93051e982b464d920398069922e': {
            versions: ['1.0.1', '1.0.2'],
            live: false,
            instance: {
              main: 4
            }
          },
          '6b8a097bed2313ac99a2ceeeb55fe8e37e5a4b1e': {
            versions: ['1.0.3'],
            live: true,
            instance: {
              main: 2
            }
          }
        }
      }
    }

    const newScale = calcInstanceDiff(serverInstances, scale)

    const expectScaleWithDiff = {
      production: {
        demo: {
          '6cdcbfc7784bdb3cddf09270f5aa853634620c38': {
            versions: ['1.0.0'],
            live: false,
            instance: {
              main: 2
            },
            add: {},
            remove: {
              main: ['sumor_app_demo_production_6cdcbfc_30001']
            }
          },
          '63394ad4b154f93051e982b464d920398069922e': {
            versions: ['1.0.1', '1.0.2'],
            live: false,
            instance: {
              main: 4
            },
            add: {
              main: 3
            },
            remove: {}
          },
          '6b8a097bed2313ac99a2ceeeb55fe8e37e5a4b1e': {
            versions: ['1.0.3'],
            live: true,
            instance: {
              main: 2
            },
            add: {
              main: 2
            },
            remove: {}
          }
        }
      }
    }
    expect(newScale).toEqual(expectScaleWithDiff)
  })
  it('calc updated site', () => {
    const scale = {
      production: {
        demo: {
          '6cdcbfc7784bdb3cddf09270f5aa853634620c38': {
            versions: ['1.0.0'],
            live: false,
            instance: {
              main: 2
            },
            add: {},
            remove: {
              main: ['sumor_app_demo_production_6cdcbfc_30001']
            }
          },
          '63394ad4b154f93051e982b464d920398069922e': {
            versions: ['1.0.1', '1.0.2'],
            live: true,
            instance: {
              main: 4
            },
            add: {
              main: 3
            },
            remove: {}
          }
        }
      }
    }
    const site = calcUpdatedSite(config, scale, {
      main: [
        {
          instanceId: 'sumor_app_demo_production_6cdcbfc_30001',
          createdTime: new Date('2024-01-01T00:00:00.000Z')
        },
        {
          instanceId: 'sumor_app_demo_production_6cdcbfc_30002',
          createdTime: new Date('2024-01-02T00:00:00.000Z')
        },
        {
          instanceId: 'sumor_app_demo_production_6cdcbfc_30003',
          createdTime: new Date('2024-01-03T00:00:00.000Z')
        },
        {
          instanceId: 'sumor_app_demo_production_63394ad_30011',
          createdTime: new Date('2024-01-03T00:00:00.000Z')
        },
        {
          instanceId: 'sumor_app_demo_production_63394ad_30012',
          createdTime: new Date('2024-01-03T00:00:00.000Z')
        },
        {
          instanceId: 'sumor_app_demo_production_63394ad_30013',
          createdTime: new Date('2024-01-03T00:00:00.000Z')
        },
        {
          instanceId: 'sumor_app_demo_production_63394ad_30014',
          createdTime: new Date('2024-01-03T00:00:00.000Z')
        }
      ]
    })
    expect(site).toEqual({
      main: {
        workerProcesses: 1,
        workerConnections: 1024,
        port: 443,
        domains: [
          {
            domain: config.server.main.domain,
            servers: [
              {
                host: config.server.main.iHost,
                port: 30011
              },
              {
                host: config.server.main.iHost,
                port: 30012
              },
              {
                host: config.server.main.iHost,
                port: 30013
              },
              {
                host: config.server.main.iHost,
                port: 30014
              }
            ]
          }
        ]
      }
    })
  })
})
