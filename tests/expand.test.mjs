import assert from 'node:assert/strict'
import {
  applyExpandedBox,
  collapseScreenContent,
  expandScreenContent,
  listExpandableNodes,
  measureContentBox,
  measureIntrinsicBox,
  resolveExpandTargets,
  snapshotInlineBox,
} from '../starter/framework/lib/board/expand.js'

function el(props = {}) {
  const node = {
    nodeType: 1,
    style: {},
    children: props.children || [],
    parentElement: null,
    offsetLeft: props.offsetLeft ?? 0,
    offsetTop: props.offsetTop ?? 0,
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

function liveSize(node, axis, fallback) {
  const key = axis === 'x' ? 'width' : 'height'
  Object.defineProperty(node, axis === 'x' ? 'offsetWidth' : 'offsetHeight', {
    get() { return parseInt(this.style[key], 10) || fallback },
    configurable: true,
  })
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
const outsideBoard = el({
  clientWidth: 1200,
  clientHeight: 800,
  children: [root],
})

const listed = listExpandableNodes(root)
assert.equal(listed[0], inner)
assert.equal(listed[1], root)
assert.equal(listed.includes(outsideBoard), false, '展开节点不得越过 screen 根节点')

const snap = snapshotInlineBox(inner)
assert.equal(snap.height, '')
applyExpandedBox(inner)
assert.equal(inner.style.height, '400px')
assert.equal(inner.style.overflow, 'visible')

inner.style.height = ''
inner.style.minHeight = ''
inner.style.overflow = ''
inner.style.overflowX = ''
inner.style.overflowY = ''
inner.style.maxWidth = ''
inner.style.maxHeight = ''
inner.style.width = ''
inner.style.minWidth = ''

inner.scrollHeight = 400
inner.offsetHeight = 400
root.scrollHeight = 400
root.offsetHeight = 400

const snapshots = expandScreenContent(root)
assert.equal(inner.style.height, '400px')
assert.equal(root.style.height, '400px')
assert.deepEqual(outsideBoard.style, {}, '展开不得改写 screen 外层画板')
assert.deepEqual(measureContentBox(root), { width: 200, height: 400 })

collapseScreenContent(snapshots)
assert.equal(inner.style.height, '')
assert.equal(root.style.height, '')

// 静态嵌套节点常共享 screen root 作为 offsetParent；offsetTop/Left 不是相对直接父级。
// 后台页层级较深时若直接累加全局 offset，会在每一层重复计算顶部和左侧偏移。
const sharedOffsetParent = el({ clientWidth: 1440, clientHeight: 900 })
const staticChild = el({
  clientWidth: 400,
  clientHeight: 200,
  offsetWidth: 400,
  offsetHeight: 200,
  offsetLeft: 140,
  offsetTop: 260,
  offsetParent: sharedOffsetParent,
})
const staticParent = el({
  clientWidth: 400,
  clientHeight: 200,
  offsetWidth: 400,
  offsetHeight: 200,
  offsetLeft: 100,
  offsetTop: 200,
  offsetParent: sharedOffsetParent,
  children: [staticChild],
})
assert.deepEqual(measureIntrinsicBox(staticParent), { width: 440, height: 260 })

// 宽表：中间 shell 非滚动（grid + width:100%），必须靠祖先链 + 子节点 offset 把外框撑开
const table = el({
  clientWidth: 800,
  offsetWidth: 800,
  scrollWidth: 2200,
  clientHeight: 200,
  offsetHeight: 200,
  scrollHeight: 200,
  __computed: { overflowX: 'auto', overflowY: 'hidden' },
})
liveSize(table, 'x', 800)
Object.defineProperty(table, 'scrollWidth', {
  get() { return Math.max(2200, parseInt(this.style.width, 10) || 800) },
  configurable: true,
})

const main = el({
  clientWidth: 800,
  offsetWidth: 800,
  scrollWidth: 800,
  clientHeight: 600,
  offsetHeight: 600,
  scrollHeight: 600,
  offsetLeft: 220,
  children: [table],
  __computed: { overflowX: 'auto', overflowY: 'auto' },
})
liveSize(main, 'x', 800)
Object.defineProperty(main, 'scrollWidth', {
  get() {
    return Math.max(800, table.offsetWidth, parseInt(this.style.width, 10) || 0)
  },
  configurable: true,
})

const aside = el({
  offsetWidth: 220,
  offsetHeight: 600,
  clientWidth: 220,
  clientHeight: 600,
  scrollWidth: 220,
  scrollHeight: 600,
})
const shell = el({
  clientWidth: 1020,
  offsetWidth: 1020,
  scrollWidth: 1020,
  clientHeight: 600,
  offsetHeight: 600,
  scrollHeight: 600,
  children: [aside, main],
  __computed: { overflowX: 'visible', overflowY: 'visible' },
})
liveSize(shell, 'x', 1020)
Object.defineProperty(shell, 'scrollWidth', {
  get() {
    return Math.max(
      1020,
      aside.offsetWidth,
      main.offsetLeft + main.offsetWidth,
      parseInt(this.style.width, 10) || 0,
    )
  },
  configurable: true,
})

const frame = el({
  clientWidth: 1020,
  offsetWidth: 1020,
  scrollWidth: 1020,
  clientHeight: 600,
  offsetHeight: 600,
  scrollHeight: 600,
  children: [shell],
  __computed: { overflowX: 'hidden', overflowY: 'auto' },
})
liveSize(frame, 'x', 1020)
Object.defineProperty(frame, 'scrollWidth', {
  get() {
    return Math.max(1020, shell.offsetWidth, parseInt(this.style.width, 10) || 0)
  },
  configurable: true,
})

assert.ok(listExpandableNodes(frame).includes(shell), '非滚动祖先也要进链')

expandScreenContent(frame)
assert.equal(table.style.width, '2200px')
assert.equal(main.style.width, '2200px')
assert.equal(shell.style.width, '2420px')
assert.equal(frame.style.width, '2420px')
assert.deepEqual(measureIntrinsicBox(frame), { width: 2420, height: 600 })

console.log('expand: pass')
