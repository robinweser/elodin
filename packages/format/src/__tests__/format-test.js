import format from '../format'

const file = `
fragment Flex {
   flexGrow: 1
  flexDirection: row
}
view Button{backgroundColor: red color: blue
     fontSize: 15
       lineHeight: 1.3

      __borderWidth: .3
       color: rgb(  255  200   155  )

  [ Type =   Primary  ] {  color:red [Mode=Dark]{color:yellow backgroundColor:green}}
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
