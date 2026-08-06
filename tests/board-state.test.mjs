import assert from 'node:assert/strict'
import {
  beginContentDragScroll,
  clampScale,
  canScrollInDirection,
  createDemoState,
  endContentDragScroll,
  findScrollableAncestor,
  fitDemoScale,
  goBackDemo,
  inferEntryId,
  isScrollableOverflow,
  moveContentDragScroll,
  navigateDemo,
  panFromDragSnapshot,
  resetDemo,
  resetCanvasViewport,
  focusCanvasScreen,
  selectDemoEntry,
  shouldZoomOnWheel,
} from '../starter/lib/board/navigation.js'
import { canUseDemo } from '../starter/lib/board/validation.js'

const screens = [
  { id: 'home', entry: true, links: ['detail'] },
  { id: 'alternate', entry: true, links: ['detail'] },
  { id: 'detail', links: [] },
]

assert.equal(clampScale(0.01), 0.2)
assert.equal(clampScale(3), 2)
assert.equal(clampScale(1.2), 1.2)

assert.equal(fitDemoScale(400, 800, 390, 844), clampScale(Math.min(400 / 390, 800 / 844)))
assert.equal(fitDemoScale(2000, 2000, 390, 844), clampScale(Math.min(2000 / 390, 2000 / 844)))
assert.equal(fitDemoScale(0, 100, 390, 844), 1)
assert.equal(fitDemoScale(100, 100, 0, 844), 1)
assert.deepEqual(resetCanvasViewport({ scale: 1.6, panX: 50, panY: -20 }), {
  scale: 1,
  panX: 0,
  panY: 0,
})

const fitsAtCurrentScale = focusCanvasScreen({
  containerWidth: 1000,
  containerHeight: 800,
  screenLeft: 48,
  screenTop: 48,
  screenWidth: 400,
  screenHeight: 500,
  currentScale: 1,
})
assert.equal(fitsAtCurrentScale.scale, 1)
assert.equal(fitsAtCurrentScale.panX, 1000 / 2 - (48 + 400 / 2) * 1)
assert.equal(fitsAtCurrentScale.panY, 800 / 2 - (48 + 500 / 2) * 1)

const needsShrink = focusCanvasScreen({
  containerWidth: 400,
  containerHeight: 400,
  screenLeft: 48,
  screenTop: 48,
  screenWidth: 400,
  screenHeight: 500,
  currentScale: 1,
})
assert.equal(needsShrink.scale, clampScale(Math.min(320 / 400, 320 / 500)))
assert.equal(needsShrink.panX, 200 - (48 + 200) * needsShrink.scale)
assert.equal(needsShrink.panY, 200 - (48 + 250) * needsShrink.scale)

const keepSmallerScale = focusCanvasScreen({
  containerWidth: 400,
  containerHeight: 400,
  screenLeft: 48,
  screenTop: 48,
  screenWidth: 400,
  screenHeight: 500,
  currentScale: 0.5,
})
assert.equal(keepSmallerScale.scale, 0.5)

assert.equal(focusCanvasScreen({
  containerWidth: 0,
  containerHeight: 400,
  screenLeft: 0,
  screenTop: 0,
  screenWidth: 100,
  screenHeight: 100,
  currentScale: 1,
}), null)
assert.equal(focusCanvasScreen({
  containerWidth: 400,
  containerHeight: 400,
  screenLeft: 0,
  screenTop: 0,
  screenWidth: 100,
  screenHeight: 0,
  currentScale: 1,
}), null)
assert.equal(focusCanvasScreen({
  containerWidth: 400,
  containerHeight: 400,
  screenLeft: 0,
  screenTop: 0,
  screenWidth: 100,
  screenHeight: 100,
  currentScale: Number.NaN,
}), null)

// Regression: endPan 清空 ref 后，React 仍可能重放 setView updater。
// updater 只能闭包 snapshot，绝不能再读 drag.current.panX。
const dragSnapshot = { x: 10, y: 20, panX: 100, panY: -40 }
assert.deepEqual(
  panFromDragSnapshot({ scale: 1.2, panX: 100, panY: -40 }, dragSnapshot, 25, 50),
  { scale: 1.2, panX: 115, panY: -10 },
)
assert.deepEqual(
  panFromDragSnapshot({ scale: 1, panX: 0, panY: 0 }, null, 25, 50),
  { scale: 1, panX: 0, panY: 0 },
)

assert.equal(inferEntryId(screens), 'home')
assert.equal(canUseDemo(screens), true)
assert.equal(canUseDemo([{ id: 'x' }]), false)

const initial = createDemoState(screens)
const detail = navigateDemo(initial, 'detail', screens)
assert.deepEqual(detail.history, ['home'])
assert.equal(detail.currentScreenId, 'detail')
assert.equal(goBackDemo(detail).currentScreenId, 'home')
assert.throws(() => navigateDemo(detail, 'alternate', screens), /links/)
assert.throws(() => navigateDemo(initial, 'missing', screens), /missing/)

const alternate = selectDemoEntry({ ...detail, hotspotsVisible: true }, 'alternate', screens)
assert.equal(alternate.entryId, 'alternate')
assert.equal(alternate.currentScreenId, 'alternate')
assert.deepEqual(alternate.history, [])
// 对齐 v1：入口下拉可选任意页，不要求 entry: true
const jumpDetail = selectDemoEntry(alternate, 'detail', screens)
assert.equal(jumpDetail.entryId, 'detail')
assert.equal(jumpDetail.currentScreenId, 'detail')
assert.throws(() => selectDemoEntry(alternate, 'missing', screens), /missing/)
assert.equal(resetDemo({ ...alternate, currentScreenId: 'detail', hotspotsVisible: true }).currentScreenId, 'alternate')
assert.equal(resetDemo({ ...alternate, currentScreenId: 'detail', hotspotsVisible: true }).hotspotsVisible, false)

assert.equal(isScrollableOverflow('auto'), true)
assert.equal(isScrollableOverflow('scroll'), true)
assert.equal(isScrollableOverflow('hidden'), false)

const midScroll = {
  scrollHeight: 400,
  clientHeight: 200,
  scrollTop: 80,
  scrollWidth: 200,
  clientWidth: 200,
  scrollLeft: 0,
}
assert.equal(canScrollInDirection(midScroll, 0, 20), true)
assert.equal(canScrollInDirection(midScroll, 0, -20), true)

const atBottom = { ...midScroll, scrollTop: 200 }
assert.equal(canScrollInDirection(atBottom, 0, 20), false)
assert.equal(canScrollInDirection(atBottom, 0, -20), true)

const root = { id: 'root' }
const scrollable = {
  nodeType: 1,
  parentElement: root,
  scrollHeight: 400,
  clientHeight: 200,
  scrollTop: 40,
  scrollWidth: 200,
  clientWidth: 200,
  scrollLeft: 0,
}
const target = { nodeType: 1, parentElement: scrollable }
globalThis.window = {
  getComputedStyle: () => ({ overflowY: 'auto', overflowX: 'hidden' }),
}

assert.equal(
  shouldZoomOnWheel({ target, deltaX: 0, deltaY: 40, ctrlKey: false, metaKey: false }),
  false,
)
assert.equal(
  shouldZoomOnWheel({ target, deltaX: 0, deltaY: 40, ctrlKey: true, metaKey: false }),
  true,
)
assert.equal(
  shouldZoomOnWheel({ target, deltaX: 0, deltaY: 40, ctrlKey: false, metaKey: true }),
  true,
)
assert.equal(
  shouldZoomOnWheel({ target: root, deltaX: 0, deltaY: 40, ctrlKey: false, metaKey: false }),
  false,
)
assert.equal(
  shouldZoomOnWheel(
    { target, deltaX: 0, deltaY: 40, ctrlKey: false, metaKey: false },
    { locked: true },
  ),
  true,
)

const contentRoot = {
  nodeType: 1,
  parentElement: null,
  scrollHeight: 500,
  clientHeight: 200,
  scrollTop: 0,
  scrollWidth: 200,
  clientWidth: 200,
  scrollLeft: 0,
  contains(node) {
    let cur = node
    while (cur) {
      if (cur === this) return true
      cur = cur.parentElement
    }
    return false
  },
  addEventListener() {},
  removeEventListener() {},
}
const contentChild = { nodeType: 1, parentElement: contentRoot }
assert.equal(findScrollableAncestor(contentChild, contentRoot), contentRoot)

assert.equal(
  beginContentDragScroll(
    { target: contentChild, button: 0, pointerId: 1, clientX: 10, clientY: 20 },
    contentRoot,
    { locked: true, scale: 1 },
  ),
  null,
)

const drag = beginContentDragScroll(
  { target: contentChild, button: 0, pointerId: 1, clientX: 10, clientY: 20 },
  contentRoot,
  { locked: false, scale: 2 },
)
assert.equal(drag.el, contentRoot)
assert.equal(drag.scale, 2)
assert.equal(drag.moved, false)

moveContentDragScroll(drag, { pointerId: 1, clientX: 10, clientY: 40 })
assert.equal(contentRoot.scrollTop, -10)
assert.equal(drag.moved, true)

endContentDragScroll(drag, contentRoot)

console.log('board-state: pass')
