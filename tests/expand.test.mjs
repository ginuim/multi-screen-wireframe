import assert from 'node:assert/strict'
import {
  applyExpandedBox,
  collapseScreenContent,
  expandScreenContent,
  listExpandableNodes,
  measureContentBox,
  resolveExpandTargets,
  snapshotInlineBox,
} from '../starter/lib/board/expand.js'

function el(props = {}) {
  const node = {
    nodeType: 1,
    style: {},
    children: props.children || [],
    parentElement: null,
    scrollWidth: props.scrollWidth ?? props.clientWidth ?? 100,
    scrollHeight: props.scrollHeight ?? props.clientHeight ?? 100,
    clientWidth: props.clientWidth ?? 100,
    clientHeight: props.clientHeight ?? 100,
    offsetWidth: props.offsetWidth ?? props.clientWidth ?? 100,
    offsetHeight: props.offsetHeight ?? props.clientHeight ?? 100,
    ...props,
  }
  for (const child of node.children) child.parentElement = node
  return node
}

globalThis.window = {
  getComputedStyle(node) {
    return node.__computed || { overflowX: 'visible', overflowY: 'visible' }
  },
}

assert.deepEqual(resolveExpandTargets(new Set(['a', 'b']), ['a', 'b', 'c']), ['a', 'b'])
assert.deepEqual(resolveExpandTargets(new Set(), ['a', 'b', 'c']), ['a', 'b', 'c'])
assert.deepEqual(resolveExpandTargets([], ['a', 'b']), ['a', 'b'])

const inner = el({
  clientWidth: 200,
  clientHeight: 100,
  scrollWidth: 200,
  scrollHeight: 400,
  __computed: { overflowX: 'hidden', overflowY: 'auto' },
})
const root = el({
  clientWidth: 200,
  clientHeight: 200,
  scrollWidth: 200,
  scrollHeight: 200,
  children: [inner],
  __computed: { overflowX: 'hidden', overflowY: 'auto' },
})

const listed = listExpandableNodes(root)
assert.equal(listed[0], inner)
assert.equal(listed[1], root)

const snap = snapshotInlineBox(inner)
assert.equal(snap.height, '')
applyExpandedBox(inner)
assert.equal(inner.style.height, '400px')
assert.equal(inner.style.overflow, 'visible')

inner.style.height = ''
inner.style.overflow = ''
inner.style.overflowX = ''
inner.style.overflowY = ''
inner.style.maxWidth = ''
inner.style.maxHeight = ''

// 撑开后内层变高，根再量一次
inner.scrollHeight = 400
root.scrollHeight = 400
root.offsetHeight = 400

const snapshots = expandScreenContent(root)
assert.equal(inner.style.height, '400px')
assert.equal(root.style.height, '400px')
assert.deepEqual(measureContentBox(root), { width: 200, height: 400 })

collapseScreenContent(snapshots)
assert.equal(inner.style.height, '')
assert.equal(root.style.height, '')

console.log('expand: pass')
