export default [
  {
    selector: '*',
    style: {
      margin: 0,
      padding: 0,
    },
  },
  {
    selector: 'div, _v',
    style: {
      display: 'flex',
      alignSelf: 'stretch',
      flexDirection: 'column',
      flexShrink: 0,
      maxWidth: '100%',
      boxSizing: 'border-box',
    },
  },
  {
    selector: '_t',
    style: {
      display: 'inline',
    },
  },
]
