const viewReset = `
display: flex;
align-self: stretch;
flex-direction: column;
flex-shrink: 0;
max-width: 100%;
box-sizing: border-box`

const textReset = `
display: inline;`

const rootReset = `
${viewReset};
position: fixed;
top: 0;
bottom: 0;
left: 0;
right: 0`

export default function getReset(rootNode = 'body') {
  return `._elo_view {${viewReset}
}

._elo_text {${textReset}
}
  
${rootNode} {${rootReset}
}`
}
