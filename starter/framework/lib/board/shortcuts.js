export const BOARD_SHORTCUTS = [
  { id: 'canvas', keys: 'Ctrl+1', label: '切换到画板模式' },
  { id: 'demo', keys: 'Ctrl+2', label: '切换到演示模式' },
  { id: 'interaction', keys: 'Ctrl+I', label: '切换可交互 / 不可交互' },
  { id: 'review', keys: 'Ctrl+M', label: '开启或关闭修改模式' },
  { id: 'immersive', keys: 'Ctrl+F', label: '切换沉浸模式' },
  { id: 'browser-fullscreen', keys: 'Ctrl+Shift+F', label: '切换浏览器全屏' },
  { id: 'hotspots', keys: 'Ctrl+H', label: '显示或隐藏演示热区' },
  { id: 'space', keys: 'Space', label: '按住临时拖动画布' },
  { id: 'escape', keys: 'Esc', label: '关闭当前面板或退出模式' },
  { id: 'help', keys: '?', label: '打开或关闭快捷键帮助' },
]

export function isEditableShortcutTarget(target) {
  if (!target) return false
  const element = target.nodeType === 3 ? target.parentElement : target
  if (!element) return false
  const tag = element.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (element.isContentEditable) return true
  return !!element.closest?.('[contenteditable]:not([contenteditable="false"])')
}

export function shortcutIdForEvent(event) {
  if (!event || event.repeat || event.metaKey || event.altKey) return null
  const key = String(event.key || '').toLowerCase()

  if (!event.ctrlKey) {
    if (!event.shiftKey && key === 'escape') return 'escape'
    if (event.key === '?') return 'help'
    return null
  }

  if (event.shiftKey) return key === 'f' ? 'browser-fullscreen' : null
  if (key === '1') return 'canvas'
  if (key === '2') return 'demo'
  if (key === 'i') return 'interaction'
  if (key === 'm') return 'review'
  if (key === 'f') return 'immersive'
  if (key === 'h') return 'hotspots'
  return null
}
