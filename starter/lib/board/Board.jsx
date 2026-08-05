import { usePrototype } from '../core/PrototypeContext.jsx'
import { CanvasMode, runExportWithFeedback } from './CanvasMode.jsx'
import { DemoMode } from './DemoMode.jsx'
import { exportSelected } from './export.js'
import { canUseDemo } from './validation.js'
import { clampScale } from './navigation.js'

const VIEWPORT_LABELS = {
  mobile: '手机',
  desktop: '桌面',
}

function ZoomControls({ scale, setScale, onReset }) {
  return (
    <div className="wf-zoom-controls">
      <button type="button" title="缩小" onClick={() => setScale((value) => clampScale(value - 0.1))}>-</button>
      <span className="wf-zoom-value">{Math.round(scale * 100)}%</span>
      <button type="button" title="放大" onClick={() => setScale((value) => clampScale(value + 0.1))}>+</button>
      <button type="button" title="重置缩放" onClick={onReset}>复位</button>
    </div>
  )
}

function PanHint({ spaceHeld }) {
  return (
    <span className={spaceHeld ? 'wf-pan-hint is-active' : 'wf-pan-hint'} title="按住空格键后拖拽，可在任意位置移动画布">
      <kbd>空格</kbd>
      {' + 拖拽移动画布'}
    </span>
  )
}

export function Board({ project }) {
  const {
    mode,
    setMode,
    setViewportKey,
    viewportKey,
    viewport,
    entryId,
    selectEntry,
    currentScreenId,
    canGoBack,
    goBack,
    reset,
  } = usePrototype()
  const demoAvailable = canUseDemo(project.screens)
  const viewportOptions = Object.keys(project.viewports)
  const currentScreen = project.screens.find((screen) => screen.id === currentScreenId)

  const [selectedIds, setSelectedIds] = React.useState(
    () => new Set(project.screens.map((screen) => screen.id)),
  )
  const [canvasScale, setCanvasScale] = React.useState(1)
  const [demoScale, setDemoScale] = React.useState(1)
  const [demoViewResetKey, setDemoViewResetKey] = React.useState(0)
  const [spaceHeld, setSpaceHeld] = React.useState(false)
  const [hotspotsVisible, setHotspotsVisible] = React.useState(false)
  const [exportError, setExportError] = React.useState(null)
  const [exporting, setExporting] = React.useState(false)

  React.useEffect(() => {
    const down = (event) => {
      if (event.code === 'Space' && !event.repeat) setSpaceHeld(true)
    }
    const up = (event) => {
      if (event.code === 'Space') setSpaceHeld(false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  React.useEffect(() => {
    if (mode !== 'demo') setHotspotsVisible(false)
  }, [mode])

  const exportIds = (ids) => runExportWithFeedback(async () => {
    setExporting(true)
    try {
      const screens = ids.map((id) => {
        const screen = project.screens.find((item) => item.id === id)
        return {
          id,
          title: screen.title,
          element: document.querySelector(`[data-screen-id="${id}"] .wf-screen-content`),
          viewport,
          projectName: project.name,
        }
      })
      await exportSelected(screens)
    } finally {
      setExporting(false)
    }
  }, setExportError)

  const resetDemo = () => {
    reset()
    setHotspotsVisible(false)
  }

  const resetDemoView = () => {
    setDemoViewResetKey((value) => value + 1)
  }

  return (
    <div className="wf-board">
      <header className="wf-board-toolbar">
        <div className="wf-toolbar-left">
          <h1 className="wf-project-name">{project.name}</h1>
          <span className="wf-project-meta">{project.screens.length} 页</span>
        </div>

        <div className="wf-toolbar-center">
          {demoAvailable ? (
            <div className="wf-mode-switcher" role="group" aria-label="模式">
              <button
                type="button"
                className={mode === 'canvas' ? 'is-active' : ''}
                onClick={() => setMode('canvas')}
              >
                画板
              </button>
              <button
                type="button"
                className={mode === 'demo' ? 'is-active' : ''}
                onClick={() => setMode('demo')}
              >
                演示
              </button>
            </div>
          ) : null}

          {viewportOptions.length > 1 ? (
            <div className="wf-viewport-switcher" role="group" aria-label="视口">
              {viewportOptions.map((key) => (
                <button
                  type="button"
                  key={key}
                  className={viewportKey === key ? 'is-active' : ''}
                  onClick={() => setViewportKey(key)}
                >
                  {VIEWPORT_LABELS[key] || key}
                </button>
              ))}
            </div>
          ) : null}

          {mode === 'canvas' || !demoAvailable ? (
            <>
              <ZoomControls
                scale={canvasScale}
                setScale={setCanvasScale}
                onReset={() => setCanvasScale(1)}
              />
              <PanHint spaceHeld={spaceHeld} />
            </>
          ) : (
            <>
              <ZoomControls
                scale={demoScale}
                setScale={setDemoScale}
                onReset={resetDemoView}
              />
              <PanHint spaceHeld={spaceHeld} />
              <button
                type="button"
                className={hotspotsVisible ? 'wf-board-button is-active' : 'wf-board-button'}
                onClick={() => setHotspotsVisible((value) => !value)}
              >
                {hotspotsVisible ? '热区 ON' : '热区 OFF'}
              </button>
              <div className="wf-demo-entry">
                <label htmlFor="wf-demo-entry">入口</label>
                <select
                  id="wf-demo-entry"
                  value={entryId}
                  onChange={(event) => selectEntry(event.target.value)}
                  title="选择演示入口页"
                >
                  {project.screens.map((screen, index) => (
                    <option key={screen.id} value={screen.id}>
                      {index + 1}. {screen.title}
                    </option>
                  ))}
                </select>
              </div>
              {canGoBack ? (
                <button type="button" className="wf-board-button" onClick={goBack}>返回</button>
              ) : null}
              <button type="button" className="wf-board-button" onClick={resetDemo}>重置</button>
              <span className="wf-demo-page-label">
                当前：
                {currentScreen
                  ? `${project.screens.findIndex((screen) => screen.id === currentScreen.id) + 1}. ${currentScreen.title} · ${currentScreen.id}.jsx`
                  : currentScreenId}
              </span>
            </>
          )}
        </div>

        <div className="wf-toolbar-right">
          <button
            type="button"
            className="wf-board-primary"
            disabled={exporting || selectedIds.size === 0 || mode === 'demo'}
            onClick={() => exportIds([...selectedIds])}
          >
            {exporting ? '导出中…' : `打包下载 (${selectedIds.size})`}
          </button>
        </div>
      </header>

      {exportError ? (
        <div className="wf-toolbar-error" role="alert">{exportError}</div>
      ) : null}

      {mode === 'canvas' ? (
        <CanvasMode
          project={project}
          scale={canvasScale}
          setScale={setCanvasScale}
          spaceHeld={spaceHeld}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onExportIds={exportIds}
        />
      ) : (
        <DemoMode
          project={project}
          hotspotsVisible={hotspotsVisible}
          spaceHeld={spaceHeld}
          scale={demoScale}
          setScale={setDemoScale}
          viewResetKey={demoViewResetKey}
        />
      )}
    </div>
  )
}
