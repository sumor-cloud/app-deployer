export default ({ registry, auth, token }) => {
  let data = ''

  data += `registry=${registry}\n`
  // for (let i in scope) {
  //     data += `@${i}:registry=${options.scope[i]}\n`;
  // }
  data += `${registry.replace('http:', '')}/:_auth=${auth}\n`
  data += `${registry.replace('http:', '')}/:email=registry@sumor.com\n`
  data += `${registry.replace('http:', '')}/:_authToken="${token}"\n`
  return data
}
