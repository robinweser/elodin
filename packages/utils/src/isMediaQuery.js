// still missing some special onces
const validMediaQueries = {
  viewportWidth: true,
  viewportHeight: true,
}

export default function isMediaQuery(str) {
  return validMediaQueries[str]
}
