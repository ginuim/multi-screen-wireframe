import { usePrototype } from '../core/PrototypeContext.jsx'
import { focusCanvasScreen, resetCanvasViewport, panFromDragSnapshot } from './navigation.js'
import { ScreenFrame } from './ScreenFrame.jsx'
import { useWheelZoom } from './useWheelZoom.js'
import { canUseDemo } from './validation.js'

export async function runExportWithFeedback(task, setError) {
  setError(null)
  try {
    await task()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setError(`导出失败：${message}`)
  }
}

/** file:// 不是 secure context，clipboard API 常不可用，execCommand 兜底 */
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.left = '-9999px'
  document.body.appendChild(area)
  area.select()
  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(area)
  }
  return Promise.resolve()
}

export function CanvasMode({
  project,
  scale,
  setScale,
  canvasLocked,
  selectedIds,
  setSelectedIds,
  onExportIds,
}) {
  const { currentScreenId, navigate, viewport, viewportKey, enterDemo: enterDemoMode } = usePrototype()
  const [view, setView] = React.useState(() => ({ ...resetCanvasViewport(), scale }))
  const [dragging, setDragging] = React.useState(false)
  const [copiedKey, setCopiedKey] = React.useState(null)
  const [copyToast, setCopyToast] = React.useState(null)
  const drag = React.useRef(null)
  const canvasRef = React.useRef(null)
  const stageRef = React.useRef(null)
  const copiedTimer = React.useRef(null)
  const scaleRef = React.useRef(scale)
  const draggingRef = React.useRef(false)
  const demoAvailable = canUseDemo(project.screens)
  scaleRef.current = scale
  draggingRef.current = dragging

  React.useEffect(() => {
    setView((current) => ({ ...resetCanvasViewport(), scale: current.scale }))
  }, [viewportKey])

  React.useEffect(() => {
    setView((current) => ({ ...current, scale }))
  }, [scale])

  React.useEffect(() => {
    if (draggingRef.current) return undefined

    const apply = () => {
      const canvas = canvasRef.current
      const stage = stageRef.current
      if (!canvas || !stage) return false
      const screenEl = stage.querySelector(`[data-canvas-screen-id="${currentScreenId}"]`)
      if (!screenEl) return false
      const currentScale = scaleRef.current
      if (currentScale <= 0) return false
      const stageBox = stage.getBoundingClientRect()
      const screenBox = screenEl.getBoundingClientRect()
      const next = focusCanvasScreen({
        containerWidth: canvas.clientWidth,
        containerHeight: canvas.clientHeight,
        screenLeft: (screenBox.left - stageBox.left) / currentScale,
        screenTop: (screenBox.top - stageBox.top) / currentScale,
        screenWidth: screenBox.width / currentScale,
        screenHeight: screenBox.height / currentScale,
        currentScale,
      })
      if (!next) return false
      setScale(next.scale)
      setView(next)
      return true
    }

    if (apply()) return undefined
    const frame = window.requestAnimationFrame(() => {
      apply()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [currentScreenId, viewportKey, setScale])

  React.useEffect(() => () => {
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
  }, [])

  useWheelZoom(canvasRef, scale, setScale, canvasLocked)

  const startPan = (event) => {
    if (!canvasLocked) return
    if (event.button != null && event.button !== 0) return
    drag.current = { x: event.clientX, y: event.clientY, panX: view.panX, panY: view.panY }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const movePan = (event) => {
    const snapshot = drag.current
    if (!snapshot) return
    const { clientX, clientY } = event
    setView((current) => panFromDragSnapshot(current, snapshot, clientX, clientY))
  }

  const endPan = () => {
    drag.current = null
    setDragging(false)
  }

  const enterDemo = (screenId) => {
    if (!demoAvailable || canvasLocked) return
    enterDemoMode(screenId)
  }

  const copyMeta = (key, text, event) => {
    event.stopPropagation()
    event.preventDefault()
    copyText(text).then(() => {
      setCopiedKey(key)
      setCopyToast('已复制')
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => {
        setCopiedKey(null)
        setCopyToast(null)
      }, 1200)
    })
  }

  const toggleSelected = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedIds((current) => {
      if (current.size === project.screens.length) return new Set()
      return new Set(project.screens.map((screen) => screen.id))
    })
  }

  return (
    <div className="wf-canvas-shell">
      <aside className="wf-screen-sidebar">
        <div className="wf-sidebar-header">
          <label>
            <input
              type="checkbox"
              checked={selectedIds.size === project.screens.length && project.screens.length > 0}
              onChange={toggleAll}
            />
            全选
          </label>
        </div>
        <ul className="wf-screen-list">
          {project.screens.map((screen, index) => (
            <li
              className={screen.id === currentScreenId ? 'is-active' : ''}
              key={screen.id}
              onClick={() => navigate(screen.id)}
              onDoubleClick={() => enterDemo(screen.id)}
              title={demoAvailable ? '双击进入演示' : undefined}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(screen.id)}
                onChange={(event) => {
                  event.stopPropagation()
                  toggleSelected(screen.id)
                }}
                onClick={(event) => event.stopPropagation()}
                aria-label={`选择 ${screen.title}`}
              />
              <span className="wf-screen-index-num">{index + 1}</span>
              <span className="wf-screen-title">{screen.title}</span>
            </li>
          ))}
        </ul>
        <div className="wf-sidebar-tips" aria-label="操作提示">
          <div className="wf-sidebar-tip">
            <span>不可交互：拖拽平移 / 滚轮缩放</span>
          </div>
          <div className="wf-sidebar-tip">
            <span>可交互：空格拖拽 / Ctrl+滚轮</span>
          </div>
        </div>
      </aside>
      <main
        ref={canvasRef}
        className={`wf-canvas${dragging ? ' is-dragging' : ''}${canvasLocked ? ' is-locked' : ''}`}
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <div
          ref={stageRef}
          className="wf-canvas-stage"
          style={{ transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.scale})` }}
        >
          {project.screens.map((screen, index) => {
            const titleText = `${index + 1}. ${screen.title}`
            const fileText = `src/screens/${screen.id}.jsx`
            const titleKey = `${screen.id}:title`
            const fileKey = `${screen.id}:file`
            return (
              <div
                className={screen.id === currentScreenId ? 'wf-canvas-screen is-focused' : 'wf-canvas-screen'}
                data-canvas-screen-id={screen.id}
                key={screen.id}
                title={demoAvailable ? '双击进入演示' : undefined}
                onClick={(event) => {
                  if (event.target.closest('.wf-export-one, .wf-screen-meta-copy')) return
                  navigate(screen.id)
                }}
                onDoubleClick={(event) => {
                  if (event.target.closest('.wf-export-one, .wf-screen-meta-copy')) return
                  event.preventDefault()
                  enterDemo(screen.id)
                }}
              >
                <div className="wf-screen-meta">
                  <div
                    className={`wf-screen-meta-title wf-screen-meta-copy${copiedKey === titleKey ? ' is-copied' : ''}`}
                    title={copiedKey === titleKey ? '已复制' : '点击复制'}
                    onClick={(event) => copyMeta(titleKey, titleText, event)}
                  >
                    {titleText}
                  </div>
                  {screen.description ? <div>{screen.description}</div> : null}
                  <div
                    className={`wf-meta-line wf-screen-meta-copy${copiedKey === fileKey ? ' is-copied' : ''}`}
                    title={copiedKey === fileKey ? '已复制' : '点击复制'}
                    onClick={(event) => copyMeta(fileKey, fileText, event)}
                  >
                    <strong>文件：</strong>
                    {fileText}
                  </div>
                </div>
                <ScreenFrame
                  screen={screen}
                  viewport={viewport}
                  mode="canvas"
                  index={index}
                  focused={screen.id === currentScreenId}
                  onExport={() => onExportIds([screen.id])}
                  canvasLocked={canvasLocked}
                  scale={view.scale}
                />
              </div>
            )
          })}
        </div>
        <div className="wf-canvas-index">
          <span className="wf-canvas-index-label">索引</span>
          <div className="wf-canvas-index-list">
            {project.screens.map((screen, index) => (
              <button
                type="button"
                key={screen.id}
                className={screen.id === currentScreenId ? 'wf-canvas-index-dot is-active' : 'wf-canvas-index-dot'}
                onClick={() => navigate(screen.id)}
                onDoubleClick={() => enterDemo(screen.id)}
                aria-label={`${index + 1}. ${screen.title}`}
                title={demoAvailable ? '双击进入演示' : undefined}
              >
                <span>{index + 1}</span>
                <span className="wf-canvas-index-tooltip" aria-hidden="true">
                  <span className="wf-canvas-index-tooltip-title">{screen.title}</span>
                  <span className="wf-canvas-index-tooltip-file">src/screens/{screen.id}.jsx</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
      {copyToast ? (
        <div className="wf-board-toast" role="status">{copyToast}</div>
      ) : null}
    </div>
  )
}
