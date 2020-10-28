import React, { useState, useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { Box } from 'kilvin'
import { useRouter } from 'next/router'
import { parse } from '@elodin/parser'
import { format } from '@elodin/format'
import { useFela } from 'react-fela'

import * as jsCss from '@elodin/generator-javascript-css'
import * as jsReactNative from '@elodin/generator-javascript-react-native'
import * as jsFela from '@elodin/generator-javascript-fela'
import * as reasonCss from '@elodin/generator-reason-css'

import Template from '../components/Template'
import Layout from '../components/Layout'
import CodeBlock from '../components/CodeBlock'

const generators = {
  'javascript-css': jsCss.createGenerator,
  'javascript-react-native': jsReactNative.createGenerator,
  'javascript-fela': jsFela.createGenerator,
  'reason-css': reasonCss.createGenerator,
}

export default () => {
  const { theme } = useFela()
  const [text, setText] = useState('')
  const [dirty, setDirty] = useState(false)
  const [devMode, setDevMode] = useState(false)
  const [generator, setGenerator] = useState('javascript-css')
  const router = useRouter()

  const generate = generators[generator]({
    devMode,
  })

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
      unstable_batchedUpdates(() => {
        setText(decodeURI(router.query.code))
        setGenerator(router.query.generator || 'javascript')
      })
    }
  }, [router.query])

  return (
    <Template>
      <Box
        direction={['column', , , 'row']}
        grow={1}
        minHeight={[1000, , , 500]}>
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
              space={6}
              alignItems="center"
              extend={{ lineHeight: 1, fontSize: 13 }}>
              <Box direction="row" space={1} alignItems="center">
                <input
                  id="devMode"
                  type="checkbox"
                  checked={devMode}
                  onChange={() => setDevMode((mode) => !mode)}
                />
                <label htmlFor="devMode">devMode</label>
              </Box>
              <Box direction="row" space={1} alignItems="center">
                Generator:
                <select
                  value={generator}
                  onChange={(e) => setGenerator(e.target.value)}>
                  <option value="javascript-css">javascript-css</option>
                  <option value="javascript-react-native">
                    javascript-react-native
                  </option>
                  <option value="javascript-fela">javascript-fela</option>
                  <option value="reason-css">reason-css</option>
                </select>
              </Box>
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
                  router.replace(
                    router.pathname +
                      '?generator=' +
                      generator +
                      '&code=' +
                      encodeURI(code)
                  )
                } else {
                  router.replace(
                    router.pathname +
                      '?generator=' +
                      generator +
                      '&code=' +
                      encodeURI(text)
                  )
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
          maxWidth={['100%', , , '50%']}
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
