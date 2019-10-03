import format from '../format'

const file = `
# foo
variant Type { Primary }
variant Mode { Dark 

 Light}
fragment Flex {
   flexGrow: 1
   #foobar
      # baz
  flexDirection: row
}
view Button{justifyContent: flexStart #baz


      __borderWidth: .3
       backgroundColor: rgb(  255  200   155  )
#bam
  [ Type =   Primary  ] {  #bazbar 
    paddingLeft: 20[Mode=Dark]{ backgroundColor:green #bam 
      __paddingLeft: 10}}
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
