import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { darwinEsbuild } from './test-platform.mjs'

const starter = new URL('../starter/', import.meta.url)
const temp = mkdtempSync(join(tmpdir(), 'wireframe-v2-errors-'))
const output = join(temp, 'boundary.cjs')

try {
  execFileSync(darwinEsbuild(starter), [
    new URL('./lib/core/ErrorBoundary.jsx', starter).pathname,
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--jsx-factory=React.createElement',
    `--outfile=${output}`,
  ], { stdio: 'pipe' })

  globalThis.React = {
    Component: class {
      constructor(props) { this.props = props }
      setState(next) { this.state = { ...this.state, ...next } }
    },
    createElement: (type, props, ...children) => ({ type, props, children }),
  }
  const { ErrorBoundary } = await import(pathToFileURL(output))
  const boundary = new ErrorBoundary({
    scope: 'screen',
    screenId: 'home',
    source: 'src/screens/home.jsx',
  })
  boundary.state = { error: Object.assign(new Error('screen failed'), { stack: 'stack' }) }
  const rendered = JSON.stringify(boundary.render())
  assert.match(rendered, /Screen: home/)
  assert.match(rendered, /src\/screens\/home\.jsx/)
  assert.match(rendered, /screen failed/)
  const previousProps = boundary.props
  boundary.props = { ...boundary.props, resetKey: 'detail' }
  boundary.componentDidUpdate(previousProps)
  assert.equal(boundary.state.error, null)

  const frameSource = readFileSync(new URL('./lib/board/ScreenFrame.jsx', starter), 'utf8')
  assert.match(frameSource, /<ErrorBoundary[\s\S]*scope="screen"/)
  assert.match(frameSource, /screenId=\{screen\.id\}/)
  assert.match(frameSource, /resetKey=\{screen\.id\}/)
} finally {
  rmSync(temp, { recursive: true, force: true })
}

console.log('error-isolation: pass')
