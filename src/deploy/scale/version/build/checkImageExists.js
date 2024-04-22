export default async (ssh, app, version) => {
  const images = await ssh.docker.images()
  const image = images.find((image) => image.Repository === app && image.Tag === version)
  return !!image
}
