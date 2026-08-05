import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { darwinEsbuild } from './test-platform.mjs'

const root = new URL('../starter/', import.meta.url)
const temp = mkdtempSync(join(tmpdir(), 'wireframe-v2-ui-'))
const output = join(temp, 'layout.cjs')
const esbuild = darwinEsbuild(root)

try {
  execFileSync(esbuild, [
    new URL('./lib/ui/layout.jsx', root).pathname,
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--jsx-factory=React.createElement',
    `--outfile=${output}`,
  ])

  globalThis.React = {
    createContext: () => ({ Provider: Symbol('Provider') }),
    useContext: () => ({
      viewportKey: 'mobile',
      navigate: () => {},
    }),
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  }

  const { Box, Column, Grid, Row } = await import(pathToFileURL(output))
  let clicked = false
  const onClick = () => {
    clicked = true
  }
  const row = Row({
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    role: 'group',
    tabIndex: 0,
    'aria-label': 'row',
    'data-kind': 'test',
    onClick,
    style: { gap: 20, alignItems: 'end', justifyContent: 'center' },
  })
  assert.equal(typeof row.props.onClick, 'function')
  row.props.onClick({ defaultPrevented: false })
  assert.equal(clicked, true)
  assert.equal(row.props.role, 'group')
  assert.equal(row.props.tabIndex, 0)
  assert.equal(row.props['aria-label'], 'row')
  assert.equal(row.props['data-kind'], 'test')
  assert.equal(row.props.style.gap, 20)
  assert.equal(row.props.style.alignItems, 'end')
  assert.equal(row.props.style.justifyContent, 'center')

  const linked = Row({ to: 'detail', gap: 4 })
  assert.equal(linked.props['data-flow-to'], 'detail')
  assert.match(linked.props.className, /wf-interactive/)
  assert.equal(linked.props.role, 'link')
  assert.equal(linked.props.tabIndex, 0)

  const column = Column({ gap: 4, style: { gap: 12 } })
  assert.equal(column.props.style.gap, 12)
  assert.equal(Box({ id: 'box' }).props.id, 'box')
  assert.equal(Grid({ columns: 3 }).props.style.gridTemplateColumns, 'repeat(3, minmax(0, 1fr))')
  assert.equal(Grid({ columns: '120px 1fr' }).props.style.gridTemplateColumns, '120px 1fr')
  assert.equal(
    Grid({ columns: { mobile: 2, desktop: 4 } }).props.style.gridTemplateColumns,
    'repeat(2, minmax(0, 1fr))',
  )
  assert.throws(() => Grid({ columns: [] }), /columns/)
} finally {
  rmSync(temp, { recursive: true, force: true })
}

console.log('ui-contract: pass')
