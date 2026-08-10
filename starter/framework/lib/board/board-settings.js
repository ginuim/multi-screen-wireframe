export const MIN_ZOOM_SENSITIVITY = 0.25
export const MAX_ZOOM_SENSITIVITY = 2
export const DEFAULT_ZOOM_SENSITIVITY = 0.6

const DEFAULT_SETTINGS = Object.freeze({
  showCanvasIndex: true,
  trackpadZoom: false,
  zoomSensitivity: DEFAULT_ZOOM_SENSITIVITY,
})

export function normalizeZoomSensitivity(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return DEFAULT_ZOOM_SENSITIVITY
  return Math.min(MAX_ZOOM_SENSITIVITY, Math.max(MIN_ZOOM_SENSITIVITY, number))
}

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
    if (parsed && typeof parsed === 'object') {
      return {
        showCanvasIndex: parsed.showCanvasIndex !== false,
        trackpadZoom: parsed.trackpadZoom === true,
        zoomSensitivity: normalizeZoomSensitivity(parsed.zoomSensitivity),
      }
    }
  } catch {
    // file:// storage can be unavailable or contain stale data.
  }
  return { ...DEFAULT_SETTINGS }
}

export function saveBoardSettings(storage, projectName, settings) {
  const normalized = {
    showCanvasIndex: settings.showCanvasIndex !== false,
    trackpadZoom: settings.trackpadZoom === true,
    zoomSensitivity: normalizeZoomSensitivity(settings.zoomSensitivity),
  }
  try {
    storage?.setItem(boardSettingsStorageKey(projectName), JSON.stringify(normalized))
    return true
  } catch {
    // Settings remain usable for the current session without persistence.
    return false
  }
}
