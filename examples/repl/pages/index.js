import React, { useState, useEffect } from 'react'
import { parse } from '@elodin/parser'
import { useRouter } from 'next/router'
import { createGenerator as createJsGenerator } from '@elodin/generator-css-in-js'
import { createGenerator as createReasonGenerator } from '@elodin/generator-reason'
import { format } from '@elodin/format'

const generators = {
  reason: {
    generate: createReasonGenerator,
  },
  'css-in-js': {
    generate: createJsGenerator,
    adapters: ['fela', 'react-fela'],
  },
}

export default () => {
  const router = useRouter()
  const [code, setCode] = useState(router.query.code || '')

  const [out, setOut] = useState({})
  const [ast, setAst] = useState({})
  const [generator, setGenerator] = useState('css-in-js')
  const [adapter, setAdapter] = useState()
  const [errors, setErrors] = useState([])

  const config = {
    adapter,
  }

  useEffect(() => {
    setAdapter(
      generators[generator].adapters
        ? generators[generator].adapters[0]
        : undefined
    )
  }, [generator])

  useEffect(() => {
    if (code) {
      history && history.replaceState({}, null, '?code=' + encodeURI(code))
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
  }, [code, generator, adapter])

  return (
    <div style={{ overflow: 'auto' }}>
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
        <select value={generator} onChange={e => setGenerator(e.target.value)}>
          {Object.keys(generators).map(name => (
            <option value={name}>{name}</option>
          ))}
        </select>
        {generators[generator].adapters ? (
          <select value={adapter} onChange={e => setAdapter(e.target.value)}>
            {generators[generator].adapters.map(name => (
              <option value={name}>{name}</option>
            ))}
          </select>
        ) : null}
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
  )
}
