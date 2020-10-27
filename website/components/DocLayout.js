import React, { useState } from 'react'
import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useFela } from 'react-fela'
import { Box, Spacer } from 'kilvin'
import { MDXProvider } from '@mdx-js/react'

import Link from './Link'
import CodeBlock from './CodeBlock'
import Template from './Template'
import Layout from './Layout'

function Heading({ level, children }) {
  const { theme } = useFela()

  return (
    <Box
      as={'h' + level}
      extend={{
        display: 'block',
        marginTop: (level === 1 ? 0 : 22) + (level === 2 ? 26 : 0),
        marginBottom: level === 1 ? 30 : 10,
        lineHeight: 1.0,
        fontWeight: level === 1 ? 700 : 600,
        '> a': {
          color: theme.colors.foreground,
        },
      }}>
      {children}
    </Box>
  )
}

const nav = {
  Intro: {
    'What & Why': 'intro/what-why',
  },
  Setup: {
    Installation: 'setup/installation',
    'Getting Started': 'setup/getting-started',
    Configuration: 'setup/configuration',
    Ecosystem: 'setup/ecosystem',
    'Editor Plugins': 'setup/editor-plugins',
  },
  Language: {
    Styles: 'language/styles',
    Primitives: 'language/primitives',
    Functions: 'language/functions',
    Conditionals: 'language/conditionals',
    Variants: 'language/variants',
    Variables: 'language/variables',
    Comments: 'language/comments',
  },
  Targets: {
    Javascript: 'targets/javascript',
    'React Native': 'targets/react-native',
    ReasonML: 'targets/reason',
  },
  Plugins: {
    'Replace Variable': 'plugins/replace-variable',
    'Rename Variable': 'plugins/rename-variable',
    Color: 'plugins/color',
  },
  Advanced: {
    'Under The Hood': 'advanced/under-the-hood',
    Specification: 'advanced/specification',
  },
  'API Reference': {
    CLI: 'api/cli',
    Core: 'api/core',
    Parser: 'api/parser',
    Traverser: 'api/traverser',
    Types: 'api/types',
    Format: 'api/format',
  },
  Extra: {
    Examples: 'extra/examples',
    FAQ: 'extra/faq',
  },
}

export default function DocLayout({ children }) {
  const [navigationVisible, setNavigationVisible] = useState(false)
  const { theme } = useFela()
  const router = useRouter()

  return (
    <Template onNavigation={() => setNavigationVisible(true)}>
      <Head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/themes/prism.min.css"
          rel="stylesheet"
        />
        <title>Elodin - Documentation </title>
      </Head>
      <Box
        minWidth={['100%', , 240]}
        paddingTop={[16, , 8]}
        paddingLeft={4}
        paddingRight={4}
        paddingBottom={12}
        display={[navigationVisible ? 'flex' : 'none', , 'flex']}
        extend={{
          backgroundColor: 'rgb(245, 245 ,245)',
          overflow: 'auto',
          position: 'fixed',
          zIndex: 3,
          left: 0,
          top: 0,
          bottom: 0,
          medium: {
            top: 44,
          },
        }}>
        <Box
          display={['flex', , 'none']}
          onClick={() => setNavigationVisible(false)}
          extend={{
            cursor: 'pointer',
            position: 'absolute',
            top: 12,
            left: 12,
            color: theme.colors.primary,
            fontSize: 20,
          }}>
          <i class="fas fa-times"></i>
        </Box>
        <Box space={8}>
          {Object.keys(nav).map((group) => (
            <Box space={2.5}>
              <Box extend={{ fontWeight: 700 }}>{group}</Box>
              <Box paddingLeft={4} space={2.5}>
                {Object.keys(nav[group]).map((page) => (
                  <NextLink href={'/docs/' + nav[group][page]} passHref>
                    <Box
                      as="a"
                      extend={{
                        textDecoration: 'none',
                        color:
                          router.pathname.indexOf(nav[group][page]) !== -1
                            ? theme.colors.primaryDark
                            : 'black',
                      }}>
                      {page}
                    </Box>
                  </NextLink>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Layout
        extend={{
          paddingLeft: 0,
          medium: {
            paddingLeft: 240,
          },
          '@media (min-width: 1500px)': {
            paddingLeft: 0,
          },
        }}>
        <Box
          paddingTop={[4, , , 6.5, 10]}
          paddingRight={[0, , , 2.5, 0]}
          paddingLeft={[0, , , 2.5, 0]}
          paddingBottom={20}>
          <MDXProvider
            components={{
              a: Link,
              pre: ({ children }) => children,
              h1: ({ children }) => <Heading level={1}>{children}</Heading>,
              h2: ({ children }) => <Heading level={2}>{children}</Heading>,
              h3: ({ children }) => <Heading level={3}>{children}</Heading>,
              h4: ({ children }) => <Heading level={4}>{children}</Heading>,
              h5: ({ children }) => <Heading level={5}>{children}</Heading>,
              strong: ({ children }) => (
                <Box
                  as="strong"
                  extend={{ display: 'inline', fontWeight: 500 }}>
                  {children}
                </Box>
              ),

              ul: ({ children }) => (
                <Box
                  as="ul"
                  space={1}
                  marginTop={2.5}
                  marginBottom={2.5}
                  paddingLeft={4.5}>
                  {children}
                </Box>
              ),
              ol: ({ children }) => (
                <Box
                  as="ol"
                  space={1}
                  marginTop={2.5}
                  marginBottom={2.5}
                  paddingLeft={4.5}>
                  {children}
                </Box>
              ),

              blockquote: ({ children }) => (
                <Box
                  extend={{
                    paddingLeft: 7,
                    left: -10,
                    position: 'relative',
                    borderLeft: '3px solid rgb(100, 100, 100)',
                    fontStyle: 'italic',
                    margin: '5px 0 15px',
                    large: {
                      left: -15,
                      paddingLeft: 12,
                    },
                    '& p': {
                      color: 'rgb(100, 100, 100)',
                      marginBottom: 0,
                      marginTop: 0,
                    },
                  }}>
                  {children}
                </Box>
              ),
              code: CodeBlock,
              inlineCode: ({ children }) => (
                <Box
                  as="pre"
                  paddingLeft={1.5}
                  paddingRight={1.5}
                  extend={{
                    display: 'inline-flex',
                    backgroundColor: theme.colors.background,
                  }}>
                  <Box
                    as="code"
                    extend={{
                      fontSize: 15,
                      fontFamily:
                        'Dank Mono, Fira Code, Hack, Consolas, monospace',
                      textRendering: 'optimizeLegibility',
                    }}>
                    {children}
                  </Box>
                </Box>
              ),
              p: ({ children }) => (
                <Box
                  as="p"
                  marginTop={1}
                  marginBottom={3}
                  extend={{
                    display: 'inline-block',
                    lineHeight: 1.5,
                    color: theme.colors.foreground,
                  }}>
                  {children}
                </Box>
              ),
              img: ({ src, title, alt }) => (
                <Box
                  as="img"
                  maxWidth="100%"
                  extend={{ display: 'block' }}
                  src={'/posts/' + id + '/' + src}
                />
              ),
              tr: ({ children }) => (
                <Box
                  as="tr"
                  direction="row"
                  extend={
                    {
                      // ':last-child': {
                      //   borderBottomWidth: 1,
                      //   borderBottomStyle: 'solid',
                      //   borderBottomColor: theme.colors.border,
                      // },
                    }
                  }>
                  {children}
                </Box>
              ),
              td: ({ children }) => (
                <Box
                  as="td"
                  padding={2.5}
                  grow={1}
                  basis={0}
                  extend={{
                    display: 'inline',
                    textAlign: 'left',

                    overflow: 'hidden',
                    lineHeight: 1.4,
                    borderWidth: 1,
                    borderBottomWidth: 0,
                    borderRightWidth: 0,
                    borderStyle: 'solid',
                    borderColor: theme.colors.border,
                    ':first-child': {
                      borderLeftWidth: 0,
                    },
                    ':last-child': {
                      // borderRightWidth: 1,
                    },
                  }}>
                  {children}
                </Box>
              ),
              th: ({ children }) => (
                <Box
                  as="th"
                  grow={1}
                  basis={0}
                  padding={2}
                  extend={{
                    textAlign: 'left',

                    lineHeight: 1.4,
                    borderWidth: 1,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderRightWidth: 0,
                    borderStyle: 'solid',
                    borderColor: theme.colors.border,
                    ':first-child': {
                      borderLeftWidth: 0,
                    },
                    ':last-child': {
                      // borderRightWidth: 1,
                    },
                  }}>
                  {children}
                </Box>
              ),
              table: ({ children }) => (
                <Box as="table" marginTop={1} grow={1}>
                  {children}
                </Box>
              ),
              hr: () => (
                <Box
                  marginTop={10}
                  marginBottom={10}
                  height={1}
                  extend={{ backgroundColor: 'rgb(200, 200, 200)' }}
                />
              ),
            }}>
            <main>{children}</main>
          </MDXProvider>
        </Box>
      </Layout>
    </Template>
  )
}
