import entity from '../utils/formatter/entity.js'
import connect from '../utils/formatter/connect.js'
import httpServer from './httpServer.js'
import section from '../utils/formatter/section.js'
import upstream from './upstream.js'
import httpsServer from './httpsServer.js'
import property from '../utils/formatter/property.js'

export default (apps) => {
  const sections = []
  for (const app of apps) {
    app.name = app.domain.replace(/\./g, '_')
    app.port = app.port || 443
    if (app.instances.length > 0) {
      sections.push(upstream(app.name, app.instances))
    }
    sections.push(httpsServer(app))
  }

  return connect([
    entity({
      user: 'root',
      worker_processes: 1
    }),
    section('events', ['worker_connections  1024;']),
    section('http', [
      property('proxy_connect_timeout', '600s'),
      property('proxy_send_timeout', '600s'),
      property('proxy_read_timeout', '600s'),
      property('server_tokens', 'off'),
      property('client_max_body_size', '10m'),
      httpServer(),
      connect(sections)
    ])
  ]).join('\n')
}
