import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { darwinEsbuild } from './test-platform.mjs'

const starter = new URL('../starter/', import.meta.url)
const temp = mkdtempSync(join(tmpdir(), 'wireframe-v2-navigation-'))
const output = join(temp, 'ui.cjs')
const calls = []

try {
  execFileSync(darwinEsbuild(starter), [
    new URL('./lib/ui/index.js', starter).pathname,
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--jsx-factory=React.createElement',
    `--outfile=${output}`,
  ])
  globalThis.React = {
    createContext: () => ({ Provider: Symbol('Provider') }),
    useContext: () => ({
      navigate: (id) => {
        if (id === 'missing') throw new Error('missing target')
        calls.push(id)
      },
      viewportKey: 'mobile',
    }),
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  }

  const { Box, Button, Card, Cell, Column, Grid, Row, SideNav, TabBar } = await import(pathToFileURL(output))
  for (const [Component, props] of [
    [Card, { to: 'detail' }],
    [Button, { to: 'detail' }],
    [Cell, { to: 'detail', title: 'Detail' }],
    [Box, { to: 'detail' }],
    [Row, { to: 'detail' }],
    [Column, { to: 'detail' }],
    [Grid, { to: 'detail', columns: 1 }],
  ]) {
    const node = Component(props)
    assert.equal(node.props['data-flow-to'], 'detail')
    let propagationStopped = false
    node.props.onClick({
      defaultPrevented: false,
      stopPropagation() { propagationStopped = true },
    })
    assert.equal(propagationStopped, true)
  }

  const side = SideNav({ items: [{ label: 'Detail', to: 'detail' }] })
  const sideList = side.type(side.props)
  const sideItem = sideList.props.children[0][0]
  assert.equal(sideItem.props['data-flow-to'], 'detail')
  sideItem.props.onClick({ defaultPrevented: false })

  const tabs = TabBar({ items: [{ label: 'Detail', to: 'detail' }] })
  assert.match(String(tabs.props.className || ''), /wf-tab-bar/)
  const tabChildren = [tabs.props.children].flat(Infinity).filter(Boolean)
  const tabItem = tabChildren.find((child) => child?.props?.['data-flow-to'])
  assert.ok(tabItem, 'TabBar should render a flow item')
  assert.equal(tabItem.props['data-flow-to'], 'detail')
  tabItem.props.onClick({ defaultPrevented: false })

  assert.equal(calls.length, 9)
  const invalid = Card({ to: 'missing' })
  assert.throws(() => invalid.props.onClick({ defaultPrevented: false }), /missing/)
} finally {
  rmSync(temp, { recursive: true, force: true })
}

console.log('navigation: pass')
