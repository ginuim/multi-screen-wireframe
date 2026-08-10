import { usePrototype } from '../core/PrototypeContext.jsx'
import { CanvasMode, runExportWithFeedback } from './CanvasMode.jsx'
import { DemoMode } from './DemoMode.jsx'
import { resolveExpandTargets } from './expand.js'
import { exportSelected } from './export.js'
import { canUseDemo } from './validation.js'
import { clampScale } from './navigation.js'
import { ReviewPanel } from './ReviewPanel.jsx'
import { ReviewMarkers } from './ReviewMarkers.jsx'
import { describeReviewElement } from './review.js'

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

/** Lucide 风格工具栏图标。仅用于框架 chrome。 */
function ToolbarIcon({ name }) {
  const paths = {
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
    fullscreen: <><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></>,
    expand: <><path d="m17 11-5-5-5 5" /><path d="m17 18-5-5-5 5" /></>,
    collapse: <><path d="m7 13 5 5 5-5" /><path d="m7 6 5 5 5-5" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
  }

  return (
    <svg className="wf-toolbar-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

/** 线框锁：开锁=可交互，闭锁=不可交互。框架 chrome 可用 SVG。 */
function LockIcon({ open }) {
  return (
    <svg className="wf-lock-icon" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
      {open ? (
        // 开锁：梁从左侧立起后向右上悬空，右脚不扣回锁体
        <path
          d="M4.25 6.75V4.35a2.75 2.75 0 0 1 5.35-.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4.25 6.75V4.5a2.75 2.75 0 0 1 5.5 0v2.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
      <rect x="2.75" y="6.75" width="8.5" height="5.5" rx="1.25" fill="currentColor" />
    </svg>
  )
}

/** interactive=true 显示开锁「可交互」；false 为上锁，可直接拖拽平移、滚轮缩放 */
function InteractionLock({ interactive, onToggle }) {
  return (
    <button
      type="button"
      className={interactive ? 'wf-interaction-lock' : 'wf-interaction-lock is-locked'}
      onClick={onToggle}
      aria-pressed={!interactive}
      title={interactive
        ? '当前可交互页面。点击锁住后：拖拽平移画布，滚轮缩放；也可按住空格临时锁住'
        : '当前已锁住。拖拽平移、滚轮缩放；页面内点击与滚动已禁用。点击恢复可交互'}
    >
      <LockIcon open={interactive} />
      <span>{interactive ? '可交互' : '不可交互'}</span>
    </button>
  )
}

function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null
}

function requestBoardFullscreen(el) {
  const request = el && (el.requestFullscreen || el.webkitRequestFullscreen)
  if (!request) return Promise.resolve()
  return Promise.resolve(request.call(el)).catch(() => {})
}

function exitBoardFullscreen() {
  if (!getFullscreenElement()) return Promise.resolve()
  const exit = document.exitFullscreen || document.webkitExitFullscreen
  if (!exit) return Promise.resolve()
  return Promise.resolve(exit.call(document)).catch(() => {})
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
  const [interactive, setInteractive] = React.useState(true)
  const [spaceHeld, setSpaceHeld] = React.useState(false)
  const [hotspotsVisible, setHotspotsVisible] = React.useState(false)
  const [exportError, setExportError] = React.useState(null)
  const [exporting, setExporting] = React.useState(false)
  const [expandedIds, setExpandedIds] = React.useState(() => new Set())
  const [immersive, setImmersive] = React.useState(false)
  const [browserFullscreen, setBrowserFullscreen] = React.useState(false)
  const [reviewEnabled, setReviewEnabled] = React.useState(false)
  const [reviewPanelVisible, setReviewPanelVisible] = React.useState(false)
  const [reviewSelections, setReviewSelections] = React.useState([])
  const [reviewMultiSelect, setReviewMultiSelect] = React.useState(false)
  const [reviewItems, setReviewItems] = React.useState([])
  const boardRef = React.useRef(null)
  const selectedReviewElementsRef = React.useRef(new Set())
  const breadcrumbHoverElementRef = React.useRef(null)

  const canvasLocked = !interactive || spaceHeld
  const allScreenIds = project.screens.map((screen) => screen.id)
  const isDemo = mode === 'demo' && demoAvailable
  const activeScale = isDemo ? demoScale : canvasScale
  const setActiveScale = isDemo ? setDemoScale : setCanvasScale

  const clearReviewSelection = React.useCallback(() => {
    for (const element of selectedReviewElementsRef.current) {
      element.classList.remove('is-review-selected')
    }
    selectedReviewElementsRef.current.clear()
    setReviewSelections([])
  }, [])

  const selectReviewElement = React.useCallback((element, screen, contentRoot, options = {}) => {
    const primary = reviewSelections[reviewSelections.length - 1]
    const activeScreen = screen || project.screens.find((item) => item.id === primary?.screenId)
    const activeRoot = contentRoot || primary?.contentRoot
    if (!element || !activeScreen || !activeRoot) return
    const nextSelection = describeReviewElement(element, activeRoot, activeScreen)
    const additive = reviewMultiSelect || options.additive
    setReviewPanelVisible(true)

    setReviewSelections((current) => {
      if (options.replaceElement) {
        options.replaceElement.classList.remove('is-review-selected')
        selectedReviewElementsRef.current.delete(options.replaceElement)
        if (current.some((item) => item.element === element && item.element !== options.replaceElement)) {
          return current.filter((item) => item.element !== options.replaceElement)
        }
        element.classList.add('is-review-selected')
        selectedReviewElementsRef.current.add(element)
        return current.map((item) => item.element === options.replaceElement ? nextSelection : item)
      }
      const alreadySelected = current.some((item) => item.element === element)
      if (!additive) {
        for (const selectedElement of selectedReviewElementsRef.current) {
          selectedElement.classList.remove('is-review-selected')
        }
        selectedReviewElementsRef.current.clear()
      } else if (alreadySelected) {
        element.classList.remove('is-review-selected')
        selectedReviewElementsRef.current.delete(element)
        return current.filter((item) => item.element !== element)
      }

      element.classList.add('is-review-selected')
      selectedReviewElementsRef.current.add(element)
      return additive ? [...current, nextSelection] : [nextSelection]
    })
  }, [project.screens, reviewMultiSelect, reviewSelections])

  const removeReviewSelection = React.useCallback((element) => {
    element?.classList.remove('is-review-selected')
    selectedReviewElementsRef.current.delete(element)
    setReviewSelections((current) => current.filter((item) => item.element !== element))
  }, [])

  const closeReview = React.useCallback(() => {
    setReviewEnabled(false)
    setReviewPanelVisible(false)
    breadcrumbHoverElementRef.current?.classList.remove('is-review-hovered')
    breadcrumbHoverElementRef.current = null
    clearReviewSelection()
  }, [clearReviewSelection])

  const hoverReviewBreadcrumb = React.useCallback((element) => {
    breadcrumbHoverElementRef.current?.classList.remove('is-review-hovered')
    breadcrumbHoverElementRef.current = element || null
    breadcrumbHoverElementRef.current?.classList.add('is-review-hovered')
  }, [])

  const toggleReview = () => {
    if (reviewEnabled) {
      closeReview()
      return
    }
    setInteractive(true)
    setReviewPanelVisible(false)
    setReviewEnabled(true)
  }

  const addReviewItem = (item) => {
    setReviewItems((current) => [
      ...current,
      { ...item, id: `review-${Date.now()}-${current.length + 1}` },
    ])
  }

  const removeReviewItem = (id) => {
    setReviewItems((current) => current.filter((item) => item.id !== id))
  }

  React.useEffect(() => () => {
    for (const element of selectedReviewElementsRef.current) {
      element.classList.remove('is-review-selected')
    }
    breadcrumbHoverElementRef.current?.classList.remove('is-review-hovered')
  }, [])

  React.useEffect(() => {
    if (!reviewEnabled) return
    clearReviewSelection()
    hoverReviewBreadcrumb(null)
    setReviewPanelVisible(false)
  }, [clearReviewSelection, hoverReviewBreadcrumb, mode, reviewEnabled, viewportKey])

  const exitImmersive = React.useCallback(() => {
    setImmersive(false)
    exitBoardFullscreen()
  }, [])

  const toggleBrowserFullscreen = () => {
    if (getFullscreenElement()) {
      exitBoardFullscreen()
      return
    }
    requestBoardFullscreen(boardRef.current)
  }

  React.useEffect(() => {
    setExpandedIds(new Set())
  }, [viewportKey])

  const toggleExpand = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandTargets = (shouldExpand) => {
    const targets = resolveExpandTargets(selectedIds, allScreenIds)
    setExpandedIds((current) => {
      const next = new Set(current)
      for (const id of targets) {
        if (shouldExpand) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  React.useEffect(() => {
    const down = (event) => {
      if (event.code !== 'Space' || event.repeat) return
      const tag = event.target && event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable) {
        return
      }
      event.preventDefault()
      setSpaceHeld(true)
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

  React.useEffect(() => {
    const sync = () => setBrowserFullscreen(!!getFullscreenElement())
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  React.useEffect(() => {
    if (!immersive) return undefined
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      if (getFullscreenElement()) return
      event.preventDefault()
      setImmersive(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [immersive])

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
          expanded: expandedIds.has(id),
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

  const resetActiveView = isDemo ? resetDemoView : () => setCanvasScale(1)

  return (
    <div
      ref={boardRef}
      className={`wf-board${immersive ? ' is-immersive' : ''}${reviewEnabled ? ' is-reviewing' : ''}`}
    >
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
              <InteractionLock
                interactive={interactive}
                onToggle={() => setInteractive((value) => !value)}
              />
            </>
          ) : (
            <>
              <ZoomControls
                scale={demoScale}
                setScale={setDemoScale}
                onReset={resetDemoView}
              />
              <InteractionLock
                interactive={interactive}
                onToggle={() => setInteractive((value) => !value)}
              />
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
            className={reviewEnabled ? 'wf-toolbar-icon-button is-active' : 'wf-toolbar-icon-button'}
            aria-pressed={reviewEnabled}
            aria-label={reviewEnabled ? `修改中（${reviewItems.length} 条意见）` : `修改（${reviewItems.length} 条意见）`}
            title="修改：点选页面节点并整理成可编辑的 AI 修改 Prompt"
            onClick={toggleReview}
          >
            <ToolbarIcon name="edit" />
            {reviewItems.length > 0 ? (
              <span className="wf-toolbar-icon-count">{reviewItems.length}</span>
            ) : null}
            <span className="wf-visually-hidden">修改</span>
          </button>
          <button
            type="button"
            className="wf-toolbar-icon-button"
            aria-label="进入沉浸模式"
            title="进入沉浸：隐藏顶栏与侧栏"
            onClick={() => {
              closeReview()
              setImmersive(true)
            }}
          >
            <ToolbarIcon name="fullscreen" />
            <span className="wf-visually-hidden">全屏</span>
          </button>
          <button
            type="button"
            className="wf-toolbar-icon-button"
            aria-label={selectedIds.size > 0 ? '展开已勾选的屏' : '展开全部屏'}
            title={selectedIds.size > 0 ? '展开已勾选的屏；无勾选时展开全部' : '展开全部屏'}
            onClick={() => expandTargets(true)}
          >
            <ToolbarIcon name="expand" />
            <span className="wf-visually-hidden">全部展开</span>
          </button>
          <button
            type="button"
            className="wf-toolbar-icon-button"
            aria-label={selectedIds.size > 0 ? '收起已勾选的屏' : '收起全部屏'}
            title={selectedIds.size > 0 ? '收起已勾选的屏；无勾选时收起全部' : '收起全部屏'}
            onClick={() => expandTargets(false)}
          >
            <ToolbarIcon name="collapse" />
            <span className="wf-visually-hidden">全部收起</span>
          </button>
          <button
            type="button"
            className="wf-toolbar-icon-button wf-toolbar-icon-button--primary"
            disabled={exporting || selectedIds.size === 0 || mode === 'demo'}
            aria-label={exporting ? '正在导出' : `打包下载（${selectedIds.size} 个屏幕）`}
            title={exporting ? '导出中…' : `打包下载 ${selectedIds.size} 个屏幕`}
            onClick={() => exportIds([...selectedIds])}
          >
            <ToolbarIcon name="download" />
            <span className="wf-toolbar-icon-count">{exporting ? '…' : selectedIds.size}</span>
            <span className="wf-visually-hidden">打包下载</span>
          </button>
        </div>
      </header>

      {exportError ? (
        <div className="wf-toolbar-error" role="alert">{exportError}</div>
      ) : null}

      {immersive ? (
        <div className="wf-immersive-chrome" role="toolbar" aria-label="沉浸控件">
          <button
            type="button"
            className="wf-board-button"
            title="退出沉浸（Esc）"
            onClick={exitImmersive}
          >
            退出
          </button>
          <button
            type="button"
            className={browserFullscreen ? 'wf-board-button is-active' : 'wf-board-button'}
            title={browserFullscreen ? '退出浏览器全屏' : '浏览器全屏'}
            onClick={toggleBrowserFullscreen}
          >
            {browserFullscreen ? '浏览器全屏 ON' : '浏览器全屏'}
          </button>
          <ZoomControls
            scale={activeScale}
            setScale={setActiveScale}
            onReset={resetActiveView}
          />
          <InteractionLock
            interactive={interactive}
            onToggle={() => setInteractive((value) => !value)}
          />
          {isDemo ? (
            <>
              {canGoBack ? (
                <button type="button" className="wf-board-button" onClick={goBack}>返回</button>
              ) : null}
              <button
                type="button"
                className={hotspotsVisible ? 'wf-board-button is-active' : 'wf-board-button'}
                onClick={() => setHotspotsVisible((value) => !value)}
              >
                {hotspotsVisible ? '热区 ON' : '热区 OFF'}
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {mode === 'canvas' ? (
        <CanvasMode
          project={project}
          scale={canvasScale}
          setScale={setCanvasScale}
          canvasLocked={canvasLocked}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          onExportIds={exportIds}
          reviewEnabled={reviewEnabled}
          onReviewSelect={selectReviewElement}
        />
      ) : (
        <DemoMode
          project={project}
          hotspotsVisible={hotspotsVisible}
          canvasLocked={canvasLocked}
          scale={demoScale}
          setScale={setDemoScale}
          viewResetKey={demoViewResetKey}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          reviewEnabled={reviewEnabled}
          onReviewSelect={selectReviewElement}
        />
      )}
      {reviewEnabled ? (
        <ReviewMarkers boardRef={boardRef} items={reviewItems} />
      ) : null}
      {reviewEnabled && reviewPanelVisible ? (
        <ReviewPanel
          project={project}
          selections={reviewSelections}
          multiSelect={reviewMultiSelect}
          items={reviewItems}
          onToggleMultiSelect={() => setReviewMultiSelect((value) => !value)}
          onSelectElement={(element) => selectReviewElement(element, null, null, {
            replaceElement: reviewSelections[reviewSelections.length - 1]?.element,
          })}
          onHoverElement={hoverReviewBreadcrumb}
          onRemoveSelection={removeReviewSelection}
          onClearSelection={clearReviewSelection}
          onAddItem={addReviewItem}
          onRemoveItem={removeReviewItem}
          onClose={closeReview}
        />
      ) : null}
    </div>
  )
}
