const viewReset = `display:flex;align-self:stretch;flex-direction:column;flex-shrink:0;max-width:100%;box-sizing:border-box`
const textReset = `display:inline`

const rootReset = `${viewReset};position:fixed;top:0;bottom:0;left:0;right:0`

const defaultGenerateClassName = type => '_elo_' + type
export function baseReset(generateClassName = defaultGenerateClassName) {
  const viewClassName = generateClassName('view')
  const textClassName = generateClassName('text')

  return `.${viewClassName}{${viewReset}}.${textClassName}{${textReset}}`
}

export function rootReset(rootNode = 'body') {
  return `${rootNode}{${rootReset}}`
}
