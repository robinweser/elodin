import React from 'react'
import { Box } from 'kilvin'
import { useFela } from 'react-fela'

export default function Link({ href, children, highlight, extern }) {
  const { theme } = useFela()

  return (
    <Box
      as="a"
      target={extern ? '_blank' : undefined}
      rel={extern ? 'noopener' : undefined}
      href={href}
      extend={{
        display: 'inline',
        alignSelf: 'flex-start',
        textDecoration: 'none',
        color: theme.colors.primaryText,
        ':hover': {
          color: theme.colors.primaryDark,
        },
      }}>
      {children}
    </Box>
  )
}
