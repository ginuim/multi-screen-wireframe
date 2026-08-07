import { isScrollableOverflow } from './navigation.js'

const STYLE_KEYS = ['width', 'height', 'overflow', 'overflowX', 'overflowY', 'maxWidth', 'maxHeight']

/** 节点当前是否因 overflow 产生可滚动溢出 */
export function isExpandableOverflowNode(el) {
  if (!el || el.nodeType !== 1) return false
  const style = window.getComputedStyle(el)
  const canY = isScrollableOverflow(style.overflowY) && el.scrollHeight > el.clientHeight + 1
  const canX = isScrollableOverflow(style.overflowX) && el.scrollWidth > el.clientWidth + 1
  return canY || canX
}

/**
 * 收集需撑开的节点：深子树先于祖先（便于先撑内层再量外层）。
 * 根节点始终包含，保证屏框尺寸跟上内容。
 */
export function listExpandableNodes(rootEl) {
  if (!rootEl) return []
  const nodes = []
  const visit = (node) => {
    const children = node.children ? Array.from(node.children) : []
    for (const child of children) visit(child)
    if (node === rootEl || isExpandableOverflowNode(node)) nodes.push(node)
  }
  visit(rootEl)
  return nodes
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

export function applyExpandedBox(el) {
  const width = el.scrollWidth
  const height = el.scrollHeight
  el.style.maxWidth = 'none'
  el.style.maxHeight = 'none'
  el.style.overflow = 'visible'
  el.style.overflowX = 'visible'
  el.style.overflowY = 'visible'
  el.style.width = `${width}px`
  el.style.height = `${height}px`
}

/** 撑开 root 内所有可滚动区域；返回用于收起的快照列表 */
export function expandScreenContent(rootEl) {
  const nodes = listExpandableNodes(rootEl)
  const snapshots = nodes.map((el) => ({ el, style: snapshotInlineBox(el) }))
  for (const { el } of snapshots) applyExpandedBox(el)
  return snapshots
}

export function collapseScreenContent(snapshots) {
  if (!Array.isArray(snapshots)) return
  for (const { el, style } of snapshots) restoreInlineBox(el, style)
}

export function measureContentBox(rootEl) {
  return {
    width: Math.max(rootEl.scrollWidth || 0, rootEl.offsetWidth || 0),
    height: Math.max(rootEl.scrollHeight || 0, rootEl.offsetHeight || 0),
  }
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
