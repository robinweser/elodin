const viewResetStyle = `display:-webkit-box;display:-moz-box;display:-ms-flexbox;display:-webkit-flex;display:flex;-webkit-overflow-scrolling:touch;align-self:stretch;flex-direction:column;-webkit-box-orient:vertical;-webkit-box-direction:normal;flex-shrink:0;max-width:100%;box-sizing:border-box`
const textResetStyle = `display:inline;`

const rootResetStyle = `${viewResetStyle};position:fixed;top:0;bottom:0;left:0;right:0`

export function baseReset(generateClassName) {
  const viewClassName = generateClassName('view')
  const textClassName = generateClassName('text')

  return `.${viewClassName}{${viewResetStyle}}.${textClassName}{${textResetStyle}}`
}

export function rootReset(rootNode = 'body') {
  return `${rootNode}{${rootResetStyle}}`
}
