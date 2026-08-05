import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { darwinEsbuild } from './test-platform.mjs'

const css = readFileSync(
  new URL('../starter/styles/prototype.css', import.meta.url),
  'utf8',
)

assert.match(css, /\.wf-screen-content\s*\{[^}]*position:\s*relative/s)
assert.match(css, /\.wf-screen-content\s*\{[^}]*transform:\s*translateZ\(0\)/s)
assert.match(css, /\.wf-overlay\s*\{[^}]*position:\s*absolute/s)
assert.doesNotMatch(css, /\.wf-overlay\s*\{[^}]*position:\s*fixed/s)
assert.match(css, /scrollbar-width:\s*thin/)

const starter = new URL('../starter/', import.meta.url)
const temp = mkdtempSync(join(tmpdir(), 'wireframe-v2-overlay-'))
const output = join(temp, 'feedback.cjs')

try {
  execFileSync(darwinEsbuild(starter), [
    new URL('./lib/ui/feedback.jsx', starter).pathname,
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--jsx-factory=React.createElement',
    `--outfile=${output}`,
  ], { stdio: 'pipe' })

  const screenRoot = { className: 'wf-screen-content' }
  const nestedContainer = {
    closest(selector) {
      assert.equal(selector, '.wf-screen-content')
      return screenRoot
    },
  }
  let portalHost = null
  globalThis.React = {
    createContext: () => ({ Provider: Symbol('Provider') }),
    useContext: () => ({ navigate() {} }),
    useRef: () => ({ current: nestedContainer }),
    useState: () => [portalHost, (value) => { portalHost = value }],
    useLayoutEffect: (effect) => effect(),
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  }
  globalThis.ReactDOM = {
    createPortal: (children, host) => ({ portal: true, children, host }),
  }

  const { Modal, Toast, LoadingOverlay } = await import(pathToFileURL(output))
  for (const component of [
    Modal({ open: true, title: '确认' }),
    Toast({ open: true, children: '完成' }),
    LoadingOverlay({ open: true }),
  ]) {
    component.type(component.props)
    const rendered = component.type(component.props)
    assert.equal(rendered.portal, true)
    assert.equal(rendered.host, screenRoot)
    portalHost = null
  }
} finally {
  rmSync(temp, { recursive: true, force: true })
}

console.log('overlay-position: pass')
