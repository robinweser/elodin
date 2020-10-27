import React, { useState, useEffect } from 'react'
import { Box } from 'kilvin'
import { useRouter } from 'next/router'
import { parse } from '@elodin/parser'
import { format } from '@elodin/format'
import { useFela } from 'react-fela'

import Template from '../components/Template'
import Layout from '../components/Layout'
import CodeBlock from '../components/CodeBlock'

import * as javascript from '@elodin/generator-javascript'
import * as reactNative from '@elodin/generator-react-native'
import * as reason from '@elodin/generator-reason'

const generators = {
  javascript: javascript.createGenerator(),
  reactNative: reactNative.createGenerator(),
  reason: reason.createGenerator(),
}

export default () => {
  const { theme } = useFela()
  const [text, setText] = useState('')
  const [dirty, setDirty] = useState(false)
  const [generator, setGenerator] = useState('javascript')
  const router = useRouter()

  const generate = generators[generator]

  let parsed, generated
  try {
    parsed = parse(text)
  } catch (e) {
    console.error(e)
    parsed = {
      errors: [{ message: 'Error' }],
    }
  }

  if (parsed && parsed.errors.length === 0) {
    try {
      generated = generate(parsed.ast, 'example.elo')
    } catch (e) {
      console.error(e)
      parsed = {
        errors: [{ message: 'Error' }],
      }
    }
  }

  const hasErrors = parsed.errors.length > 0

  useEffect(() => {
    if (!dirty && router.query.code) {
      setText(decodeURI(router.query.code))
    }
  }, [router.query])

  return (
    <Template>
      <Box direction={['column', , , 'row']} grow={1}>
        <Box grow={1} shrink={0} basis={0} alignSelf="stretch">
          <Box
            padding={2}
            direction={['column', , , , 'row']}
            space={2}
            alignItems="center"
            justifyContent="space-between">
            <Box extend={{ fontSize: 12 }}>
              ⌘/Ctrl + S to save and format your code
            </Box>
            <Box
              direction="row"
              space={2}
              alignItems="center"
              extend={{ lineHeight: 1 }}>
              Generator:
              <select
                value={generator}
                onChange={(e) => setGenerator(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="reactNative">React Native</option>
                <option value="reason">Reason</option>
              </select>
            </Box>
          </Box>
          <Box
            as="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (
                (window.navigator.platform.match('Mac')
                  ? e.metaKey
                  : e.ctrlKey) &&
                e.keyCode == 83
              ) {
                e.preventDefault()

                setDirty(true)

                const { errors, code } = format(text)

                if (errors.length === 0) {
                  setText(code)
                  router.replace(router.pathname + '?code=' + encodeURI(code))
                } else {
                  router.replace(router.pathname + '?code=' + encodeURI(text))
                }

                // Process the event here (such as click on submit button)
              }
            }}
            grow={1}
            padding={2}
            extend={{
              appearance: 'none',
              outline: 0,
              resize: 'none',
              fontSize: 15,

              borderLeftWidth: 0,
              borderColor: theme.colors.border,
              fontFamily: 'Dank Mono, Fira Code, Hack, Consolas, monospace',
              textRendering: 'optimizeLegibility',
              ':focus': {
                borderColor: theme.colors.primary,
              },
            }}
          />
        </Box>
        <Box
          grow={1}
          shrink={0}
          basis={0}
          extend={{
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: theme.colors.border,
          }}>
          {hasErrors && (
            <Box
              padding={4}
              grow={1}
              extend={{
                backgroundColor: 'rgba(255, 0,0,0.3)',
                overflow: 'auto',
              }}>
              {parsed.errors.map((error) => {
                const { message, ...rest } = error

                return (
                  <Box space={7}>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: message.replace(/\n/gi, '<br>'),
                      }}
                    />
                    <Box as="pre" extend={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(rest, null, 2)}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}
          {!hasErrors && (
            <Box
              grow={1}
              shrink={1}
              basis={0}
              padding={4}
              extend={{ overflow: 'auto' }}>
              {Object.keys(generated).map((file) => (
                <CodeBlock
                  name={file}
                  nocopy
                  className={
                    'language-' +
                    (file.indexOf('.js') !== -1
                      ? 'javascript'
                      : file.indexOf('.re') !== -1
                      ? 'reason'
                      : 'css')
                  }>
                  {generated[file]}
                </CodeBlock>
              ))}
            </Box>
          )}
          {/* {!hasErrors && (
            <Box height="100%" padding={4} extend={{ overflow: 'auto' }}>
              <Box as="pre" grow={0} shrink={0} basis={0} marginBottom={4}>
                {JSON.stringify(parsed.ast, null, 2)}
              </Box>
            </Box>
          )} */}
        </Box>
      </Box>
    </Template>
  )
}

/** example code 
variant Intent {
  Positive
  Negative
}

style Button {
  color: red
  fontSize: $theme_sizes_button
  paddingLeft: add(3 4)
  [Intent=Positive] {
    color: green
  }
  [Intent=Negative] {
    color: red
  }
}

style Label {
  fontSize: 12
  color: blue
}
*/
