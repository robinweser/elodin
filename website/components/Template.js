import React from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Box, Spacer } from 'kilvin'
import { useFela } from 'react-fela'

import Layout from './Layout'
import Link from './Link'
import NavItem from './NavItem'

const nav = {
  '/': 'Home',
  '/docs': 'Docs',
  '/try': 'Try',
}

export default function Template({ children, onNavigation }) {
  const { theme } = useFela()
  const router = useRouter()

  const showFooter = router.pathname.indexOf('docs') === -1

  return (
    <Box grow={1}>
      <Box
        direction="row"
        height={44}
        alignItems="center"
        extend={{
          backgroundColor: theme.colors.primaryDark,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2,
        }}>
        <Layout>
          <Box direction="row">
            <Box display={['flex', , 'none']}>
              {onNavigation && (
                <NavItem onClick={onNavigation}>
                  <i class="fas fa-bars"></i>
                </NavItem>
              )}
            </Box>
            {Object.keys(nav).map((path) => (
              <NavItem path={path}>{nav[path]}</NavItem>
            ))}
          </Box>
        </Layout>
      </Box>
      <Box grow={1} paddingTop={11}>
        {children}
      </Box>
      {showFooter && (
        <Box
          paddingTop={8}
          paddingBottom={8}
          extend={{ backgroundColor: theme.colors.background }}>
          <Layout>
            <Box space={10}>
              <Box direction={['column', , 'row']} space={[10, , '15%']}>
                <Box space={2}>
                  <Box as="p" extend={{ fontWeight: 500 }}>
                    Documentation
                  </Box>
                  <Link href="/docs/setup/installation">Installation</Link>
                  <Link href="/docs/setup/getting-started">
                    Getting Started
                  </Link>
                  <Link href="/docs/extra/examples">Examples</Link>
                </Box>
                <Box space={2}>
                  <Box as="p" extend={{ fontWeight: 500 }}>
                    Links
                  </Box>

                  <Link href="https://github.com/robinweser/elodin">
                    Github
                  </Link>
                </Box>
              </Box>
              <Box extend={{ display: 'block' }}>
                Elodin is written with ❤︎ by{' '}
                <Link href="https://weser.io">@robinweser.</Link>
              </Box>
            </Box>
          </Layout>
        </Box>
      )}
    </Box>
  )
}
