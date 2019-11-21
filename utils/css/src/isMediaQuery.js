// still missing some special onces
const validMediaQueries = {
  viewportWidth: true,
  viewportHeight: true,
  landscape: true,
  portrait: true,
}

export default function isMediaQuery(str) {
  return validMediaQueries[str]
}
