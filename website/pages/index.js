import React from 'react'
import { Box } from 'kilvin'
import { useFela } from 'react-fela'

import Template from '../components/Template'
import Layout from '../components/Layout'
import CodeBlock from '../components/CodeBlock'
import Button from '../components/Button'

const tryHref = `/try?code=variant%20Intent%20%7B%0A%20%20Positive%0A%20%20Negative%0A%7D%0A%0Astyle%20Button%20%7B%0A%20%20paddingLeft:%2010%0A%20%20paddingRight:%2010%0A%20%20%5BIntent=Positive%5D%20%7B%0A%20%20%20%20color:%20green%0A%20%20%7D%0A%20%20%5BIntent=Negative%5D%20%7B%0A%20%20%20%20color:%20red%0A%20%20%7D%0A%7D%0A%0Astyle%20Label%20%7B%0A%20%20fontSize:%20$theme_sizes_label%0A%7D`

const example = `variant Intent {
  Positive
  Negative
}

style Button {
  paddingLeft: 10
  paddingRight: 10
  [Intent=Positive] {
    color: green
  }
  [Intent=Negative] {
    color: red
  }
}

style Label {
  fontSize: $theme_sizes_label
}`

export default () => {
  const { theme } = useFela()

  return (
    <Template>
      <Box
        padding={10}
        minHeight={['20vh', , '40vh']}
        justifyContent="center"
        space={10}
        extend={{ backgroundColor: theme.colors.background }}>
        <Box
          as="img"
          width="100%"
          alignSelf="center"
          maxWidth={[300, , 700]}
          src="/wordmark.svg"
        />
        <Box space={8}>
          <Layout>
            <Box direction={['column', , 'row']} space={16} alignItems="center">
              <Box grow={1}>
                <CodeBlock nocopy>{example}</CodeBlock>
              </Box>
              <Box
                grow={1}
                extend={{
                  fontSize: 26,
                  lineHeight: 1.4,
                  maxWidth: 480,
                  textAlign: 'center',
                  fontWeight: 300,
                }}>
                Elodin let's you write type-safe component styles in a simple
                and familiar way.
                <br />
                It unifies the way we write styles for cross-platform
                components.
              </Box>
            </Box>
          </Layout>
          <Box direction="row" space={3} alignSelf="center">
            <Button href="/docs/setup/installation">Quick Start</Button>
            <Button href={tryHref} variant="secondary">
              Try Online
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        paddingLeft={[4, , 12]}
        paddingRight={[4, , 12]}
        paddingTop={[6, , 15]}
        paddingBottom={[10, , 20]}>
        <Layout>
          <Box space={[10, , 15]}>
            <Box direction={['column', , 'row']} space={[10, , 15]} wrap="wrap">
              <Box grow={1} shrink={0} basis={['auto', , 0]} space={1.5}>
                <Box extend={{ fontSize: 20, fontWeight: 500 }}>
                  Component-based
                </Box>
                <Box as="p" extend={{ lineHeight: 1.5 }}>
                  Styles are authored on component-base and fully encapsulated
                  from other styles accounting for predictable styling without
                  side-effects. It also enables automatic code-splitting where
                  each component is rendered to a new file.
                </Box>
              </Box>
              <Box grow={1} shrink={0} basis={['auto', , 0]} space={1.5}>
                <Box extend={{ fontSize: 20, fontWeight: 500 }}>
                  Write Once, Use Everywhere
                </Box>
                <Box as="p" extend={{ lineHeight: 1.5 }}>
                  Elodin compiles to a variety of different languages, platforms
                  and libraries without having to change a single line. It's
                  truly one file for all targets!
                </Box>
              </Box>
            </Box>
            <Box direction={['column', , 'row']} space={[10, , 15]} wrap="wrap">
              <Box grow={1} shrink={0} basis={['auto', , 0]} space={1.5}>
                <Box extend={{ fontSize: 20, fontWeight: 500 }}>
                  Type-safe Properties
                </Box>
                <Box as="p" extend={{ lineHeight: 1.5 }}>
                  The compiler will validate every property-value pair and throw
                  on invalid rules resulting in solid code and bulletproof
                  output. If it compiles, it works!
                </Box>
              </Box>
              <Box grow={1} shrink={0} basis={['auto', , 0]} space={1.5}>
                <Box extend={{ fontSize: 20, fontWeight: 500 }}>
                  Quick Learning-curve
                </Box>
                <Box as="p" extend={{ lineHeight: 1.5 }}>
                  The syntax is a mix of CSS and JavaScript with some concepts
                  from ReasonML and thus already familiar to many developers. It
                  is declarative and unlike CSS only supports one value per
                  property.
                </Box>
              </Box>
            </Box>
          </Box>
        </Layout>
      </Box>
    </Template>
  )
}
