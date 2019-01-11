import format from '../format'

const file = `
fragment Flex {
   display:   flex
  flexDirection: row
}
style Button{backgroundColor: red color: blue
     fontSize: 15
       lineHeight: 1.3
       borderWidth: 0.3
       borderColor: rgb(  255  200   155  )

  [ Type =   Primary  ] {  color:red [Mode=Dark]{color:yellow backgroundColor:green}}
  }

   style    Label {
lineHeight:   $lineHeight
     padding   : 20

     [@hover] {
       color:red
     }

     [@minWidth=320] {
       color:blue [@hover] {
         color: green
       }
     }
}`

describe('Formatting elodin syntax', () => {
  it('should return beautiful syntax', () => {
    expect(format(file)).toMatchSnapshot()
  })

  it('should return beautiful syntax with custom syntax', () => {
    expect(
      format(file, {
        ident: '    ',
      })
    ).toMatchSnapshot()
  })
})
