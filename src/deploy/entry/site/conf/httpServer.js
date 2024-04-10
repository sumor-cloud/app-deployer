import section from './formatter/section.js'

export default () => section('server', [
  'listen 80 default_server;',
  'server_name _;',
  'return 301 https://$host$request_uri;'
])
