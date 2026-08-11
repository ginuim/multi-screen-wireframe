const SHORTCUT_DEFINITIONS = [
  { id: 'canvas', suffix: '1', label: '切换到画板模式' },
  { id: 'demo', suffix: '2', label: '切换到演示模式' },
  { id: 'interaction', suffix: 'I', label: '切换可交互 / 不可交互' },
  { id: 'review', suffix: 'M', label: '开启或关闭修改模式' },
  { id: 'immersive', suffix: '3', label: '切换沉浸模式' },
  { id: 'browser-fullscreen', suffix: 'Shift+F', label: '切换浏览器全屏' },
  { id: 'hotspots', suffix: 'H', label: '显示或隐藏演示热区' },
  { id: 'space', keys: 'Space', label: '按住临时拖动画布' },
  { id: 'escape', keys: 'Esc', label: '关闭当前面板或退出模式' },
  { id: 'help', keys: '?', label: '打开或关闭帮助 / 快捷键' },
]

export function isMacPlatform() {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/i.test(`${navigator.platform || ''} ${navigator.userAgent || ''}`)
}

export function shortcutModifierLabel(isMac = isMacPlatform()) {
  return isMac ? 'Ctrl' : 'Alt'
}

export function getBoardShortcuts(isMac = isMacPlatform()) {
  const modifier = shortcutModifierLabel(isMac)
  return SHORTCUT_DEFINITIONS.map((shortcut) => shortcut.keys
    ? shortcut
    : { ...shortcut, keys: `${modifier}+${shortcut.suffix}` })
}

export const BOARD_SHORTCUTS = getBoardShortcuts()

export function isEditableShortcutTarget(target) {
  if (!target) return false
  const element = target.nodeType === 3 ? target.parentElement : target
  if (!element) return false
  const tag = element.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (element.isContentEditable) return true
  return !!element.closest?.('[contenteditable]:not([contenteditable="false"])')
}

export function shortcutIdForEvent(event, isMac = isMacPlatform()) {
  if (!event || event.repeat) return null
  const key = String(event.key || '').toLowerCase()
  const modifier = isMac ? event.ctrlKey : event.altKey

  if (!modifier) {
    if (!event.shiftKey && key === 'escape') return 'escape'
    if (event.key === '?') return 'help'
    return null
  }

  if (event.shiftKey) return key === 'f' ? 'browser-fullscreen' : null
  if (key === '1') return 'canvas'
  if (key === '2') return 'demo'
  if (key === 'i') return 'interaction'
  if (key === 'm') return 'review'
  if (key === '3') return 'immersive'
  if (key === 'h') return 'hotspots'
  return null
}
