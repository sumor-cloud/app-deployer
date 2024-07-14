import { exec } from 'child_process'

export default (
  execString,
  parameter
  // logCallback
) =>
  new Promise((resolve, reject) => {
    const childProcess = exec(execString, parameter)
    let log = ''
    let err = ''
    const formatData = data => {
      data = data.toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      return data
    }
    childProcess.stdout.on('data', async data => {
      data = formatData(data)
      log += data
      // if (logCallback) {
      //   logCallback(data)
      // }
    })
    childProcess.stderr.on('data', async data => {
      data = formatData(data)
      log += data
      err += data
      // if (logCallback) {
      //   logCallback(data)
      // }
    })
    childProcess.on('close', async code => {
      if (code !== 0) {
        reject(err)
      } else {
        resolve(log)
      }
    })
  })
