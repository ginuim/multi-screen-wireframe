import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { darwinEsbuild } from './test-platform.mjs'

const root = new URL('../starter/', import.meta.url)
const temp = mkdtempSync(join(tmpdir(), 'wireframe-v2-data-'))
const output = join(temp, 'data.cjs')
const esbuild = darwinEsbuild(root)
const css = readFileSync(new URL('./styles/prototype.css', root), 'utf8')

try {
  execFileSync(esbuild, [
    new URL('./lib/ui/data.jsx', root).pathname,
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--jsx-factory=React.createElement',
    `--outfile=${output}`,
  ])

  globalThis.React = {
    createContext: () => ({ Provider: Symbol('Provider') }),
    useContext: () => ({ navigate: () => {}, viewportKey: 'mobile' }),
    createElement: (type, props, ...children) => ({
      type,
      props: { ...props, children: children.flat() },
    }),
  }

  const { EmptyState, Steps } = await import(pathToFileURL(output))
  const steps = Steps({
    current: 1,
    items: [
      { id: 'a', label: '基本信息' },
      { id: 'b', label: '资料上传' },
      { id: 'c', label: '提交' },
    ],
  })

  assert.match(steps.props.className, /wf-steps-horizontal/)
  const items = steps.props.children
  assert.equal(items.length, 3)
  assert.match(items[0].props.className, /wf-steps-item-done/)
  assert.match(items[1].props.className, /wf-steps-item-current/)
  assert.match(items[2].props.className, /wf-steps-item-todo/)

  const firstIndicator = items[0].props.children[0]
  const firstMark = firstIndicator.props.children[0]
  const firstLine = firstIndicator.props.children[1]
  assert.ok(firstMark.props.children == null || firstMark.props.children[0] == null)
  assert.equal(firstLine.props.className, 'wf-steps-line')
  assert.equal(items[2].props.children[0].props.children[1], null)

  const empty = EmptyState({
    title: '暂无理赔记录',
    description: '新的申请会显示在这里。',
    action: '发起理赔',
  })
  assert.match(empty.props.className, /wf-empty-state/)
  assert.equal(empty.props.children[0].props.className, 'wf-empty-icon')
  assert.equal(empty.props.children[1].props.className, 'wf-empty-title')
  assert.equal(empty.props.children[2].props.className, 'wf-empty-desc')
  assert.equal(empty.props.children[3].props.className, 'wf-empty-action')

  assert.match(css, /\.wf-steps-line\s*\{/)
  assert.match(css, /\.wf-steps-item-done \.wf-step-mark::after/)
  assert.match(css, /\.wf-empty-icon\s*\{/)
  assert.doesNotMatch(css, /\.wf-empty-state[\s\S]*wf-empty-shape/)
} finally {
  rmSync(temp, { recursive: true, force: true })
}

console.log('data-contract: pass')
