export default [
  {
    selector: '*',
    style: {
      margin: 0,
      padding: 0,
    },
  },
  {
    selector: '::-webkit-scrollbar',
    style: {
      display: 'none',
    },
  },
  {
    selector: 'div',
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
    selector: 'body',
    style: {
      fontFamily: '-apple-system, Helvetica Neue, Arial, sans-serif',
      overscrollBehavior: 'none',
      backgroundColor: 'rgb(240,240,240)',
      overflow: 'auto',
      fontSize: 16,
    },
  },
]
