import format from '../format'

const file = `
fragment Flex {
   flexGrow: 1
  flexDirection: row
}
view Button{justifyContent: flexStart


      __borderWidth: .3
       backgroundColor: rgb(  255  200   155  )

  [ Type =   Primary  ] {  paddingLeft: 20[Mode=Dark]{ backgroundColor:green}}
  }

   text    Label {
lineHeight:   $lineHeight
    fontSize: 20

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
    expect(format(file).code).toMatchSnapshot()
  })

  it('should return beautiful syntax with custom syntax', () => {
    expect(
      format(
        file,
        {
          ident: '    ',
        }.code
      )
    ).toMatchSnapshot()
  })
})
