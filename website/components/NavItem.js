import React from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { Box } from 'kilvin'
import { useFela } from 'react-fela'

export default function NavItem({ path, children }) {
  const { theme } = useFela()
  const router = useRouter()

  return (
    <NextLink href={path} passHref>
      <Box
        as="a"
        paddingLeft={1.5}
        paddingRight={1.5}
        height="100%"
        extend={{
          cursor: 'pointer',
          marginTop: -1,
          lineHeight: 1,
          textDecoration: 'none',
          color: (
            path === '/'
              ? router.pathname === '/'
              : router.pathname.indexOf(path) !== -1
          )
            ? theme.colors.primaryLight
            : 'white',
          ':first-child': {
            paddingLeft: 0,
          },
          ':last-child': {
            paddingRight: 0,
          },
        }}>
        {children}
      </Box>
    </NextLink>
  )
}
