import section from './formatter/section.js'
import entity from './formatter/entity.js'

export default (app) => {
  let host
  if (app.instances.length > 0) {
    host = entity({
      'proxy_set_header Host': '$host',
      'proxy_set_header X-Real-IP': '$remote_addr',
      'proxy_set_header X-Forwarded-For': '$remote_addr',
      proxy_pass: `https://${app.name}_stream`
    })
  } else {
    host = entity({
      root: '/etc/nginx/pages',
      index: 'no_instance.html'
    })
  }
  return section('server', [
    entity({
      server_tokens: 'off',
      listen: `${app.port} ssl http2`,
      server_name: app.domain,
      access_log: `/tmp/${app.name}_access.log`,
      error_log: `/tmp/${app.name}_error.log`,
      ssl_certificate: `ssl/${app.domain}/domain.crt`,
      ssl_certificate_key: `ssl/${app.domain}/domain.key`,
      ssl_session_timeout: '5m'
      // ssl_ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4',
      // ssl_protocols: 'TLSv1 TLSv1.1 TLSv1.2',
      // ssl_prefer_server_ciphers: 'on'
    }),
    section('location /', [
      host
    ])
  ])
}
