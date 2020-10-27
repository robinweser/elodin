import React from 'react'
import { Box } from 'kilvin'
import { useFela } from 'react-fela'

export default function Button({
  children,
  href,
  variant = 'primary',
  onClick,
}) {
  const { theme } = useFela()

  return (
    <Box
      as={href ? 'a' : 'button'}
      onClick={onClick}
      href={href}
      extend={{
        cursor: 'pointer',
        appearance: 'none',
        textDecoration: 'none',
        padding: '8px 12px',
        borderRadius: 4,

        fontSize: 18,
        fontFamily: 'inherit',

        borderWidth: 2,
        borderStyle: 'solid',
        transition: 'all 100ms linear',

        extend: [
          {
            condition: variant === 'primary',
            style: {
              color: 'white',
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
              ':hover': {
                backgroundColor: theme.colors.primaryDark,
                borderColor: theme.colors.primaryDark,
              },
            },
          },
          {
            condition: variant === 'secondary',
            style: {
              color: theme.colors.primary,
              borderColor: theme.colors.primary,
              backgroundColor: 'transparent',
              ':hover': {
                backgroundColor: theme.colors.primaryDark,
                borderColor: theme.colors.primaryDark,
                color: 'white',
              },
            },
          },
        ],
      }}>
      {children}
    </Box>
  )
}
