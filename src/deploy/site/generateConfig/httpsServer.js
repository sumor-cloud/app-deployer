import section from '../utils/formatter/section.js'
import entity from '../utils/formatter/entity.js'

export default app => {
  let host
  if (app.instances.length > 0) {
    host = entity({
      'proxy_set_header Host': '$host',
      'proxy_set_header X-Real-IP': '$remote_addr',
      'proxy_set_header X-Forwarded-For': '$remote_addr',
      proxy_pass: `https://${app.name}_stream`,
      proxy_ssl_server_name: 'on',
      proxy_ssl_name: '$host'
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
      ssl_session_timeout: '5m',
      ssl_ciphers:
        'EECDH+AESGCM:EECDH+CHACHA20:ECDH+AESGCM:ECDH+AES256:DH+AESGCM:DH+AES256:ECDH+AES128:DH+AES:RSA+AESGCM:RSA+AES:!aNULL:!MD5:!DSS',
      ssl_protocols: 'TLSv1.2 TLSv1.3',
      ssl_prefer_server_ciphers: 'on'
    }),
    section('location /', [host])
  ])
}
