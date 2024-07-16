import server from './server.js'
import repo from './repo.js'
export default {
  source: {
    demo: repo.version
  },
  server: {
    main: server
  },
  env: {
    production: {
      demo: {
        domain: server.domain,
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
