import format from '../format'

const file = `
variant Mode { Dark 

 Light}
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

    color: rgb(200 120 0)
     [@hover] {
       color: rgba(255 0 120 percentage(50))
     }

     [@minWidth=320] {
       color:hex(f3f3f3) [@hover] {
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
