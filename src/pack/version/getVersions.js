import getCommits from '../git/getCommits.js'
import parseTagVersion from './parseTagVersion.js'
import parseBranchVersion from './parseBranchVersion.js'

const timeFormatter = val => Math.round(new Date(val).getTime())

export default async (folder, branch) => {
  const commits = await getCommits(folder, branch)

  const { major: defaultMajor, minor: defaultMinor } = parseBranchVersion(branch)

  const versions = {}

  let betaMajor = 0
  let betaMinor = 0
  let betaPatch = 0
  for (const commit of commits) {
    let isBetaVersion = true
    for (const tag of commit.tags) {
      const versionInfo = parseTagVersion(tag)
      if (
        versionInfo &&
        (!defaultMajor || versionInfo.major === defaultMajor) &&
        (!defaultMinor || versionInfo.minor === defaultMinor) &&
        typeof versionInfo.patch === 'number'
      ) {
        // 符合当前版本的子版本
        const version = versionInfo.name

        betaMajor = versionInfo.major
        betaMinor = versionInfo.minor
        betaPatch = versionInfo.patch + 1

        // if(versionInfo.major > betaMajor){
        //     betaMajor = versionInfo.major
        //     betaMinor = versionInfo.minor
        //     betaPatch = versionInfo.patch
        // }else if(versionInfo.minor > betaMinor){
        //     betaMinor = versionInfo.minor
        //     betaPatch = versionInfo.patch
        // } else if(versionInfo.patch > betaPatch){
        //     betaPatch = versionInfo.patch
        // }
        versions[version] = {
          id: commit.id,
          name: version,
          authorDate: timeFormatter(commit.authorDate),
          committerDate: timeFormatter(commit.committerDate),
          beta: false
        }
        isBetaVersion = false
      } else {
        isBetaVersion = true
      }
    }
    if (isBetaVersion) {
      const version = `${defaultMajor || betaMajor}.${defaultMinor || betaMinor}.${betaPatch}`
      if (!versions[version] || versions[version].beta === true) {
        versions[version] = {
          id: commit.id,
          name: version,
          authorDate: timeFormatter(commit.authorDate),
          committerDate: timeFormatter(commit.committerDate),
          beta: true
        }
      }
    }
  }

  return versions
}
