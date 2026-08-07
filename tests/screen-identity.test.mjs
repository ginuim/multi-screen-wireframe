import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { darwinEsbuild } from './test-platform.mjs'

const starter = new URL('../starter/', import.meta.url)
const temp = mkdtempSync(join(tmpdir(), 'wireframe-v2-screen-id-'))
const output = join(temp, 'identity.cjs')

try {
  execFileSync(darwinEsbuild(starter), [
    new URL('./framework/lib/core/ScreenIdentity.jsx', starter).pathname,
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--jsx-factory=React.createElement',
    `--outfile=${output}`,
  ], { stdio: 'pipe' })

  const stack = []
  globalThis.React = {
    createContext: () => ({ Provider: 'Provider' }),
    useContext: () => stack[stack.length - 1] ?? null,
    createElement: (type, props, ...children) => {
      if (type === 'Provider') {
        stack.push(props.value)
        const child = props.children ?? children[0]
        const result = typeof child?.type === 'function' ? child.type(child.props) : child
        stack.pop()
        return result
      }
      return { type, props: { ...props, children } }
    },
  }

  const { ScreenIdentityProvider, useScreenId } = await import(pathToFileURL(output))

  function Probe() {
    return useScreenId()
  }

  const home = ScreenIdentityProvider({
    screenId: 'home',
    children: { type: Probe, props: {} },
  })
  const claims = ScreenIdentityProvider({
    screenId: 'claims',
    children: { type: Probe, props: {} },
  })

  assert.equal(home, 'home')
  assert.equal(claims, 'claims')
  assert.throws(() => useScreenId(), /useScreenId/)
} finally {
  rmSync(temp, { recursive: true, force: true })
}

console.log('screen-identity: pass')
