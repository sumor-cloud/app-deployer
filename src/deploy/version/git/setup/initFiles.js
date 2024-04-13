import fse from 'fs-extra'

export default async (root) => {
  await fse.writeFile(`${root}/.gitignore`, `# IDE configuration
.idea

# generated files
node_modules
output
dist
tmp

# system
.DS_Store`)
  await fse.writeFile(`${root}/README.md`, '')
}
