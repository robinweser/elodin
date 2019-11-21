import defaultHash from 'murmurhash-js'

export default function generateClassName(
  module,
  devMode = false,
  hash = defaultHash
) {
  const hashedBody = '_' + hash(JSON.stringify(module.body))

  if (devMode) {
    return module.name + hashedBody
  }

  return hashedBody
}
