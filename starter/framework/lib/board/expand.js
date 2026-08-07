import { isScrollableOverflow } from './navigation.js'

const STYLE_KEYS = [
  'width',
  'height',
  'minWidth',
  'minHeight',
  'overflow',
  'overflowX',
  'overflowY',
  'maxWidth',
  'maxHeight',
]

/** 节点当前是否因 overflow 产生可滚动溢出 */
export function isExpandableOverflowNode(el) {
  if (!el || el.nodeType !== 1) return false
  const style = window.getComputedStyle(el)
  const canY = isScrollableOverflow(style.overflowY) && el.scrollHeight > el.clientHeight + 1
  const canX = isScrollableOverflow(style.overflowX) && el.scrollWidth > el.clientWidth + 1
  return canY || canX
}

function depthFrom(rootEl, el) {
  let depth = 0
  let node = el
  while (node && node !== rootEl) {
    depth += 1
    node = node.parentElement
  }
  return depth
}

/**
 * 收集需撑开的节点：可滚动节点 + 上溯到 root 的祖先。
 * 深节点在前，先撑内层再撑外壳（避免 grid / width:100% 把外框卡死）。
 */
export function listExpandableNodes(rootEl) {
  if (!rootEl) return []
  const scrollables = []
  const visit = (node) => {
    const children = node.children ? Array.from(node.children) : []
    for (const child of children) visit(child)
    if (node === rootEl || isExpandableOverflowNode(node)) scrollables.push(node)
  }
  visit(rootEl)

  const set = new Set(scrollables)
  for (const el of scrollables) {
    // root 本身已在集合中；从它的父节点继续上溯会越过 screen 边界，
    // 把 ScreenFrame、canvas、board 甚至 body/html 一并改写。
    if (el === rootEl) continue
    let node = el.parentElement
    while (node) {
      set.add(node)
      if (node === rootEl) break
      node = node.parentElement
    }
  }

  return [...set].sort((a, b) => depthFrom(rootEl, b) - depthFrom(rootEl, a))
}

export function snapshotInlineBox(el) {
  const out = {}
  for (const key of STYLE_KEYS) out[key] = el.style[key] || ''
  return out
}

export function restoreInlineBox(el, snapshot) {
  for (const key of STYLE_KEYS) {
    el.style[key] = snapshot[key] || ''
  }
}

/**
 * overflow:visible 时部分浏览器 scrollWidth ≈ clientWidth，
 * 所以再扫子节点 offset 边界，避免宽表撑不开外框。
 */
export function measureIntrinsicBox(el) {
  let width = Math.max(el.scrollWidth || 0, el.offsetWidth || 0)
  let height = Math.max(el.scrollHeight || 0, el.offsetHeight || 0)
  const children = el.children ? Array.from(el.children) : []
  for (const child of children) {
    width = Math.max(width, (child.offsetLeft || 0) + (child.offsetWidth || 0))
    height = Math.max(height, (child.offsetTop || 0) + (child.offsetHeight || 0))
  }
  return { width, height }
}

export function applyExpandedBox(el) {
  el.style.maxWidth = 'none'
  el.style.maxHeight = 'none'
  el.style.overflow = 'visible'
  el.style.overflowX = 'visible'
  el.style.overflowY = 'visible'
  const { width, height } = measureIntrinsicBox(el)
  el.style.width = `${width}px`
  el.style.height = `${height}px`
  el.style.minWidth = `${width}px`
  el.style.minHeight = `${height}px`
}

/** 撑开 root 内所有可滚动区域及其祖先；返回用于收起的快照列表 */
export function expandScreenContent(rootEl) {
  const nodes = listExpandableNodes(rootEl)
  const snapshots = nodes.map((el) => ({ el, style: snapshotInlineBox(el) }))
  for (const { el } of snapshots) applyExpandedBox(el)
  // 子级撑开后，根再量一次，吃掉残余溢出
  applyExpandedBox(rootEl)
  return snapshots
}

export function collapseScreenContent(snapshots) {
  if (!Array.isArray(snapshots)) return
  for (const { el, style } of snapshots) restoreInlineBox(el, style)
}

export function measureContentBox(rootEl) {
  return measureIntrinsicBox(rootEl)
}

/**
 * 工具栏展开/收起目标：
 * 有勾选 → 勾选集合；无勾选 → 全部屏。
 */
export function resolveExpandTargets(selectedIds, allIds) {
  if (selectedIds instanceof Set) {
    if (selectedIds.size > 0) return [...selectedIds]
  } else if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    return [...selectedIds]
  }
  return [...allIds]
}
