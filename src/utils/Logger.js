import Logger from '@sumor/logger'

// original code is en
const code = {
  trace: {},
  debug: {
    DEPLOY_ADD_INSTANCE_SUMMARY:
      'Increase instance [{app}] [{version}] from {current} to {target} in server [{server}] env [{env}]',
    DEPLOY_UPDATE_SITE_SUMMARY: 'Update site in server {server}',
    DEPLOY_REMOVE_INSTANCE_SUMMARY:
      'Decrease instance [{app}] [{version}] from {current} to {target} in server [{server}] env [{env}]',
    DEPLOY_ADD_SHIP_CODE: 'app [{app}] not shipped in server [{server}], shipping code',
    DEPLOY_ADD_SHIP_CODE_FINISHED: 'app [{app}] ship finished, path {path}',
    DEPLOY_ADD_PACK_CODE: 'app [{app}] not packed in server [{server}], packing code',
    DEPLOY_ADD_PACK_CODE_FINISHED: 'app [{app}] pack finished',
    DEPLOY_ADD_BUILD_CODE: 'app [{app}] building with [npm i, npm run build] in server [{server}]',
    DEPLOY_ADD_BUILD_CODE_FINISHED: 'app [{app}] build finished in {time}ms',
    DEPLOY_ADD_START_INSTANCE: 'start instance [{name}] for server [{server}] in {time}ms'
  },
  info: {
    DEPLOY_STARTED: 'Deploy started',
    DEPLOY_FINISHED: 'Deploy finished',
    DEPLOY_ADD_INSTANCE: 'Deploy add instance',
    DEPLOY_ADD_INSTANCE_FINISHED: 'Deploy add instance finished',
    DEPLOY_UPDATE_SITE: 'Deploy update site',
    DEPLOY_UPDATE_SITE_FINISHED: 'Deploy update site finished',
    DEPLOY_REMOVE_INSTANCE: 'Deploy remove instance',
    DEPLOY_REMOVE_INSTANCE_FINISHED: 'Deploy remove instance finished'
  },
  warn: {},
  error: {}
}

// languages: zh, es, ar, fr, ru, de, pt, ja, ko
const i18n = {
  zh: {
    DEPLOY_STARTED: '部署开始'
  }
}
export default new Logger({
  scope: 'DEPLOYER',
  code,
  i18n
})
