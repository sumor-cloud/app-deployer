import getBranchs from './branchs.js'

export default async (root) => {
  const branchs = await getBranchs(root)
  return branchs.filter((obj) => obj.current)[0]
}
