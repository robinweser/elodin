import React, { useState, useEffect } from 'react'
import { parse } from '@elodin/parser'
import { useRouter } from 'next/router'
import { createGenerator as createJsGenerator } from '@elodin/generator-css-in-js'
import { createGenerator as createReasonGenerator } from '@elodin/generator-reason'
import { createGenerator as createReactNativeGenerator } from '@elodin/generator-react-native'
import felaAdapter from '@elodin/generator-css-in-js/lib/adapters/fela'
import reactFelaAdapter from '@elodin/generator-css-in-js/lib/adapters/react-fela'
import { format } from '@elodin/format'

import { make as PageLayout } from '../components/PageLayout.bs.js'

const generators = {
  reason: {
    generate: createReasonGenerator,
  },
  'css-in-js': {
    generate: createJsGenerator,
    adapters: { fela: felaAdapter, 'react-fela': reactFelaAdapter },
  },
  'react-native': {
    generate: createReactNativeGenerator,
  },
}

export default () => {
  const router = useRouter()
  const [code, setCode] = useState('')

  const [out, setOut] = useState({})
  const [ast, setAst] = useState({})
  const [devMode, setDevMode] = useState(false)
  const [generator, setGenerator] = useState('css-in-js')
  const [adapter, setAdapter] = useState('fela')
  const [errors, setErrors] = useState([])

  const config = {
    devMode: devMode,
    adapter:
      adapter && generators[generator].adapters
        ? generators[generator].adapters[adapter]
        : undefined,
  }

  useEffect(() => {
    if (router.query.code) {
      setCode(router.query.code)
    }
  }, [router])

  useEffect(() => {
    setAdapter(
      generators[generator].adapters
        ? Object.keys(generators[generator].adapters)[0]
        : undefined
    )
  }, [generator])

  useEffect(() => {
    if (code) {
      // use try/catch to catch replaceState overuse errors
      try {
        history && history.replaceState({}, null, '?code=' + encodeURI(code))
      } catch (e) {}
    }
  }, [code])

  useEffect(() => {
    try {
      const parsed = parse(code)

      if (parsed.errors.length === 0) {
        setAst(parsed.ast)
        setOut(generators[generator].generate(config)(parsed.ast, 'index'))
      } else {
        setOut({})
      }

      setErrors(parsed.errors)
    } catch (e) {
      throw new Error(e)
    }
  }, [code, generator, adapter, devMode])

  return (
    <PageLayout>
      <div>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          style={{ height: '30vh', width: '100%' }}
        />
        <div>
          <button
            onClick={() => {
              try {
                const formatted = format(code)
                setCode(formatted.code)
                setErrors(formatted.errors)
              } catch (e) {
                throw new Error(e)
              }
            }}>
            Format
          </button>
          <select
            value={generator}
            onChange={e => setGenerator(e.target.value)}>
            {Object.keys(generators).map(name => (
              <option value={name}>{name}</option>
            ))}
          </select>
          {generators[generator].adapters ? (
            <select value={adapter} onChange={e => setAdapter(e.target.value)}>
              {Object.keys(generators[generator].adapters).map(name => (
                <option value={name}>{name}</option>
              ))}
            </select>
          ) : null}
          <span>
            DevMode:{' '}
            <input
              type="checkbox"
              checked={devMode}
              onChange={_ => setDevMode(!devMode)}
            />
          </span>
          <div style={{ backgroundColor: 'rgba(250, 0,0, 0.2)' }}>
            <b>Errors</b>
            {errors.map(error => (
              <div>{JSON.stringify(error)}</div>
            ))}
          </div>
          {errors.length > 0 ? null : (
            <>
              <details>
                <summary>AST</summary>
                <pre>{JSON.stringify(ast, null, 2)}</pre>
              </details>
              {Object.keys(out).map(filename => (
                <div>
                  <b>{filename}</b>
                  <pre style={{ backgroundColor: 'rgb(250, 250, 250)' }}>
                    <code dangerouslySetInnerHTML={{ __html: out[filename] }} />
                  </pre>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
