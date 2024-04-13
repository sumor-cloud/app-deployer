import getBranches from './branches.js'

export default async (root) => {
  const branches = await getBranches(root)
  return branches.filter((obj) => obj.current)[0]
}
