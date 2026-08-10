const DEFAULT_SETTINGS = Object.freeze({ showCanvasIndex: true })

export function getBoardStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function boardSettingsStorageKey(projectName) {
  return `wf-board-settings:${projectName}`
}

export function readBoardSettings(storage, projectName) {
  try {
    const parsed = JSON.parse(storage?.getItem(boardSettingsStorageKey(projectName)))
    if (typeof parsed?.showCanvasIndex === 'boolean') {
      return { showCanvasIndex: parsed.showCanvasIndex }
    }
  } catch {
    // file:// storage can be unavailable or contain stale data.
  }
  return { ...DEFAULT_SETTINGS }
}

export function saveBoardSettings(storage, projectName, settings) {
  const normalized = { showCanvasIndex: settings.showCanvasIndex !== false }
  try {
    storage?.setItem(boardSettingsStorageKey(projectName), JSON.stringify(normalized))
    return true
  } catch {
    // Settings remain usable for the current session without persistence.
    return false
  }
}
