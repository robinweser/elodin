import { parse } from '@elodin/core'

import createGenerator from '../createGenerator'

const file = `
variant Variant {
  Primary
  Destructive
}

variant Intent {
  Inline
  Outline
}

variant Size {
  Small
  Normal
  Big
}

view Button {
  __display: inlineFlex
  __MozAppearance: none
  __appearance: none
  __border: 0
  __cursor: pointer
  __WebkitAppearance: none
  __transition: raw("200ms all ease-in-out")
  width: percentage(100)
  alignSelf: flexStart
  flexShrink: 1
  flexDirection: row
  paddingTop: 8
  paddingBottom: 8
  paddingLeft: 20
  paddingRight: 20
  alignItems: center
  justifyContent: center
  borderRadius: 7
  [@disabled] {
    __boxShadow: none
    __cursor: notAllowed
    backgroundColor: rgb(190 190 190)
    [@hover] {
      __boxShadow: none
      backgroundColor: rgb(190 190 190)
    }
  }
  [Variant=Primary] {
    __boxShadow: raw("0 4px 12px rgba(0, 207, 192, 0.4)")
    backgroundColor: rgb(0 176 164)
    [@hover] {
      __boxShadow: raw("0 6px 20px rgba(0, 207, 192, 0.2)")
      backgroundColor: rgb(0 166 154)
    }
    [@active] {
      backgroundColor: rgb(0 156 144)
    }
  }
  [Variant=Destructive] {
    __boxShadow: raw("0 4px 12px rgba(220, 60, 110, 0.4)")
    backgroundColor: rgb(209 50 90)
    [@hover] {
      __boxShadow: raw("0 6px 20px rgba(220, 60, 110, 0.2)")
      backgroundColor: rgb(200 40 80)
    }
    [@active] {
      backgroundColor: rgb(190 30 70)
    }
  }
  [Intent=Inline] {
    __boxShadow: none
    borderRadius: 0
    [@hover] {
      __boxShadow: none
    }
  }
  [Intent=Outline] {
    __boxShadow: none
    backgroundColor: raw("transparent")
    borderWidth: 2
    borderStyle: solid
    [Variant=Primary] {
      borderColor: rgb(0 176 164)
      [@hover] {
        borderColor: rgb(0 166 154)
      }
      [@active] {
        borderColor: rgb(0 156 144)
      }
    }
    [Variant=Destructive] {
      borderColor: rgb(209 50 90)
      [@hover] {
        borderColor: rgb(200 40 80)
      }
      [@active] {
        borderColor: rgb(190 30 70)
      }
    }
  }
}

text ButtonText {
  fontSize: 18
  lineHeight: 1.5
  color: rgb(255 255 255)
  textAlign: center
  letterSpacing: -.1
  textDecorationLine: none
  [@disabled] {
    color: rgb(240 240 240)
  }
  [Size=Small] {
    fontSize: 16
  }
  [Size=Big] {
    fontSize: 20
  }
  [Intent=Outline] {
    [Variant=Primary] {
      __textShadow: raw("0 4px 12px rgba(0, 207, 192, 0.4)")
      color: rgb(0 176 164)
    }
    [Variant=Destructive] {
      __textShadow: raw("0 4px 12px rgba(220, 60, 110, 0.4)")
      color: rgb(209 50 90)
    }
    [@hover] {
      color: white
    }
  }
}
`

describe('Compiling to ReasonML', () => {
  it.only('should return a map of files', () => {
    const { ast } = parse(file)

    expect(createGenerator()(ast, 'root.elo')).toMatchSnapshot()
  })

  it('should return a map of files in devMode', () => {
    const { ast } = parse(file)

    expect(
      createGenerator({ devMode: true })(ast, 'root.elo')
    ).toMatchSnapshot()
  })
})
