import defaultHash from './hash'

export default function getModuleName(
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
