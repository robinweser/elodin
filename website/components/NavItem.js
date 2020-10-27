import React from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { Box } from 'kilvin'
import { useFela } from 'react-fela'

export default function NavItem({ path, children, onClick }) {
  const { theme } = useFela()
  const router = useRouter()

  const inner = (
    <Box
      as={onClick ? 'div' : 'a'}
      onClick={onClick}
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
          paddingRight: onClick ? 8 : 0,
        },
        large: {
          ':first-of-type': {
            paddingLeft: 0,
          },
        },
      }}

      // active={
      //   path === '/'
      //     ? router.pathname === '/'
      //     : router.pathname.indexOf(path) !== -1
      // }
    >
      {children}
    </Box>
  )

  if (onClick) {
    return inner
  }

  return (
    <NextLink href={path} passHref>
      {inner}
    </NextLink>
  )
}
