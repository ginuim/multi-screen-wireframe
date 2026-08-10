import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  getBoardShortcuts,
  isEditableShortcutTarget,
  shortcutModifierLabel,
  shortcutIdForEvent,
} from '../starter/framework/lib/board/shortcuts.js'
import {
  boardSettingsStorageKey,
  readBoardSettings,
  saveBoardSettings,
} from '../starter/framework/lib/board/board-settings.js'
import {
  clampCanvasIndexPosition,
  defaultCanvasIndexPosition,
  waitForCanvasIndexElements,
} from '../starter/framework/lib/board/canvas-index.js'

function key(key, options = {}) {
  return {
    key,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    repeat: false,
    ...options,
  }
}

assert.equal(shortcutIdForEvent(key('1', { altKey: true }), false), 'canvas')
assert.equal(shortcutIdForEvent(key('2', { altKey: true }), false), 'demo')
assert.equal(shortcutIdForEvent(key('i', { altKey: true }), false), 'interaction')
assert.equal(shortcutIdForEvent(key('M', { altKey: true }), false), 'review')
assert.equal(shortcutIdForEvent(key('3', { altKey: true }), false), 'immersive')
assert.equal(shortcutIdForEvent(key('f', { altKey: true }), false), null)
assert.equal(shortcutIdForEvent(key('F', { altKey: true, shiftKey: true }), false), 'browser-fullscreen')
assert.equal(shortcutIdForEvent(key('3', { altKey: true, shiftKey: true }), false), null)
assert.equal(shortcutIdForEvent(key('h', { altKey: true }), false), 'hotspots')
assert.equal(shortcutIdForEvent(key('1', { ctrlKey: true }), false), null)
assert.equal(shortcutIdForEvent(key('1', { metaKey: true }), false), null)
assert.equal(shortcutIdForEvent(key('1', { ctrlKey: true }), true), 'canvas')
assert.equal(shortcutIdForEvent(key('1', { metaKey: true }), true), null)
assert.equal(shortcutIdForEvent(key('?', { shiftKey: true })), 'help')
assert.equal(shortcutIdForEvent(key('Escape')), 'escape')
assert.equal(shortcutIdForEvent(key('i', { altKey: true, ctrlKey: true }), false), 'interaction')
assert.equal(shortcutIdForEvent(key('i', { altKey: true, repeat: true }), false), null)
assert.equal(shortcutModifierLabel(false), 'Alt')
assert.equal(shortcutModifierLabel(true), 'Ctrl')
assert.equal(getBoardShortcuts(false).find((shortcut) => shortcut.id === 'review')?.keys, 'Alt+M')
assert.equal(getBoardShortcuts(true).find((shortcut) => shortcut.id === 'review')?.keys, 'Ctrl+M')

assert.equal(isEditableShortcutTarget({ tagName: 'INPUT' }), true)
assert.equal(isEditableShortcutTarget({ tagName: 'TEXTAREA' }), true)
assert.equal(isEditableShortcutTarget({ tagName: 'SELECT' }), true)
assert.equal(isEditableShortcutTarget({ tagName: 'DIV', isContentEditable: true }), true)
assert.equal(isEditableShortcutTarget({ tagName: 'BUTTON', closest: () => null }), false)

const values = new Map()
const storage = {
  getItem: (name) => values.get(name) ?? null,
  setItem: (name, value) => values.set(name, value),
}
assert.deepEqual(readBoardSettings(storage, '订单原型'), { showCanvasIndex: true })
assert.equal(saveBoardSettings(storage, '订单原型', { showCanvasIndex: false }), true)
assert.deepEqual(readBoardSettings(storage, '订单原型'), { showCanvasIndex: false })
assert.deepEqual(JSON.parse(values.get(boardSettingsStorageKey('订单原型'))), { showCanvasIndex: false })
assert.equal(Object.hasOwn(JSON.parse(values.get(boardSettingsStorageKey('订单原型'))), 'position'), false)

const brokenStorage = {
  getItem: () => { throw new Error('blocked') },
  setItem: () => { throw new Error('blocked') },
}
assert.deepEqual(readBoardSettings(brokenStorage, '本地文件'), { showCanvasIndex: true })
assert.equal(saveBoardSettings(brokenStorage, '本地文件', { showCanvasIndex: false }), false)

assert.deepEqual(
  defaultCanvasIndexPosition({ width: 1000, height: 700 }, { width: 300, height: 40 }),
  { x: 350, y: 644 },
)
assert.deepEqual(
  clampCanvasIndexPosition({ x: -100, y: 900 }, { width: 1000, height: 700 }, { width: 300, height: 40 }),
  { x: 16, y: 644 },
)
assert.deepEqual(
  clampCanvasIndexPosition({ x: 100, y: 100 }, { width: 200, height: 100 }, { width: 300, height: 120 }),
  { x: 16, y: 16 },
)

const scheduledFrames = []
const cancelledFrames = []
let canvasReady = false
let readyElements = null
const stopWaiting = waitForCanvasIndexElements(
  () => canvasReady ? { container: 'canvas', item: 'index' } : { container: null, item: 'index' },
  (elements) => { readyElements = elements },
  {
    request: (callback) => {
      scheduledFrames.push(callback)
      return scheduledFrames.length
    },
    cancel: (frame) => cancelledFrames.push(frame),
  },
)
scheduledFrames.shift()()
assert.equal(readyElements, null, 'initialization waits when the parent canvas ref is not ready')
canvasReady = true
scheduledFrames.shift()()
assert.deepEqual(readyElements, { container: 'canvas', item: 'index' })
stopWaiting()
assert.deepEqual(cancelledFrames, [])

const boardSource = readFileSync(new URL('../starter/framework/lib/board/Board.jsx', import.meta.url), 'utf8')
const canvasSource = readFileSync(new URL('../starter/framework/lib/board/CanvasMode.jsx', import.meta.url), 'utf8')
const panelSource = readFileSync(new URL('../starter/framework/lib/board/BoardPanels.jsx', import.meta.url), 'utf8')
const cssSource = readFileSync(new URL('../starter/framework/styles/prototype.css', import.meta.url), 'utf8')
assert.match(boardSource, /shortcutIdForEvent/)
assert.match(boardSource, /saveBoardSettings/)
assert.match(boardSource, /canvasIndexPosition/)
assert.match(boardSource, /canvasIndexSettingsProjectRef/)
assert.match(boardSource, /previousName != null && previousName !== project\.name/)
assert.doesNotMatch(
  boardSource,
  /React\.useEffect\(\(\) => \{\s*const settings = readBoardSettings\([\s\S]*?setCanvasIndexPosition\(null\)\s*\}, \[project\.name\]\)/,
)
assert.match(boardSource, /<ShortcutHelp/)
assert.match(boardSource, /wf-board-utility/)
assert.match(canvasSource, /wf-canvas-index-handle/)
assert.match(canvasSource, /wf-canvas-index-close/)
assert.match(canvasSource, /Ctrl\+滚轮/)
assert.match(canvasSource, /ResizeObserver/)
assert.match(canvasSource, /waitForCanvasIndexElements/)
assert.match(canvasSource, /needsDefaultPosition/)
assert.match(canvasSource, /constrain\(current, current == null\)/)
assert.match(canvasSource, /closest\?\.?\('\.wf-canvas-index'\)/)
assert.match(canvasSource, /if \(!demoAvailable\) return/)
assert.doesNotMatch(canvasSource, /if \(!demoAvailable \|\| canvasLocked\) return/)
assert.match(panelSource, /显示画板索引/)
assert.match(panelSource, /帮助 \/ 快捷键/)
assert.match(boardSource, /wf-immersive-action-button is-active/)
assert.match(cssSource, /\.wf-board-panel-layer/)
assert.match(cssSource, /\.wf-canvas-index\.is-dragging/)
assert.match(cssSource, /\.wf-canvas\.is-locked \.wf-canvas-index/)

console.log('shortcuts-settings-index: pass')
