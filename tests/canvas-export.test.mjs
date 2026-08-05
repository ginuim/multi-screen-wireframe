import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { darwinEsbuild } from './test-platform.mjs'

const starter = new URL('../starter/', import.meta.url)
const temp = mkdtempSync(join(tmpdir(), 'wireframe-v2-canvas-export-'))
const output = join(temp, 'canvas.cjs')

try {
  execFileSync(darwinEsbuild(starter), [
    new URL('./lib/board/CanvasMode.jsx', starter).pathname,
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--jsx-factory=React.createElement',
    `--outfile=${output}`,
  ], { stdio: 'pipe' })

  globalThis.React = {
    Component: class {},
    createContext: () => ({ Provider: Symbol('Provider') }),
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  }
  const { runExportWithFeedback } = await import(pathToFileURL(output))
  const messages = []
  await runExportWithFeedback(
    async () => { throw new Error('本地导出库损坏') },
    (message) => messages.push(message),
  )
  assert.deepEqual(messages, [null, '导出失败：本地导出库损坏'])

  let completed = false
  await runExportWithFeedback(async () => { completed = true }, (message) => messages.push(message))
  assert.equal(completed, true)
  assert.equal(messages.at(-1), null)
} finally {
  rmSync(temp, { recursive: true, force: true })
}

console.log('canvas-export: pass')
