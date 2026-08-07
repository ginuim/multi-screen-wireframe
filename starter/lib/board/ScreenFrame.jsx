import { usePrototype } from '../core/PrototypeContext.jsx'
import { ErrorBoundary } from '../core/ErrorBoundary.jsx'
import { ScreenIdentityProvider } from '../core/ScreenIdentity.jsx'
import { handleDelegatedFlowClick } from '../ui/flow-target.js'
import {
  collapseScreenContent,
  expandScreenContent,
  measureContentBox,
} from './expand.js'
import {
  beginContentDragScroll,
  endContentDragScroll,
  moveContentDragScroll,
} from './navigation.js'

export function ScreenFrame({
  screen,
  viewport,
  mode,
  index = 0,
  focused = false,
  onExport,
  expanded = false,
  onToggleExpand,
  canvasLocked = false,
  scale = 1,
}) {
  const { navigate } = usePrototype()
  const contentRef = React.useRef(null)
  const dragRef = React.useRef(null)
  const expandSnapshotRef = React.useRef(null)
  const [dragScrolling, setDragScrolling] = React.useState(false)
  const [expandedBox, setExpandedBox] = React.useState(null)

  React.useLayoutEffect(() => {
    const root = contentRef.current
    if (!root || !screen) return undefined

    if (expandSnapshotRef.current) {
      collapseScreenContent(expandSnapshotRef.current)
      expandSnapshotRef.current = null
    }

    if (!expanded) {
      setExpandedBox(null)
      return undefined
    }

    expandSnapshotRef.current = expandScreenContent(root)
    setExpandedBox(measureContentBox(root))

    return () => {
      if (expandSnapshotRef.current) {
        collapseScreenContent(expandSnapshotRef.current)
        expandSnapshotRef.current = null
      }
    }
  }, [expanded, screen?.id, viewport.width, viewport.height])

  if (!screen) return null

  const Component = screen.component
  const frameClass = [
    'wf-screen-chrome',
    mode === 'canvas' && focused ? 'is-focused' : '',
    expanded ? 'is-expanded' : '',
    `wf-screen-${mode}`,
  ].filter(Boolean).join(' ')

  const onPointerDown = (event) => {
    // 画布锁定时不接管屏内拖拽滚动，让事件落到画布平移
    if (canvasLocked) {
      event.preventDefault()
      return
    }
    // 已展开无可滚区域，不抢指针
    if (expanded) return
    const state = beginContentDragScroll(event, contentRef.current, { locked: canvasLocked, scale })
    if (!state) return
    dragRef.current = state
    setDragScrolling(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event) => {
    const state = dragRef.current
    if (!state) return
    moveContentDragScroll(state, event)
  }

  const onPointerEnd = (event) => {
    const state = dragRef.current
    if (!state || state.pointerId !== event.pointerId) return
    endContentDragScroll(state, contentRef.current)
    dragRef.current = null
    setDragScrolling(false)
  }

  const onContentClick = (event) => {
    handleDelegatedFlowClick(event, contentRef.current, navigate)
  }

  const contentStyle = expanded && expandedBox
    ? { width: expandedBox.width, height: expandedBox.height, overflow: 'visible' }
    : { width: viewport.width, height: viewport.height }

  const frameWidth = expanded && expandedBox ? expandedBox.width : viewport.width

  return (
    <section
      className={frameClass}
      data-screen-id={screen.id}
      data-expanded={expanded ? 'true' : 'false'}
      style={{ width: frameWidth }}
    >
      <div className="wf-screen-chrome-label">
        <span className="wf-screen-chrome-title">
          <span className="wf-screen-index-num">{index + 1}</span>
          <span>{screen.title}</span>
          <span className="wf-screen-file">{screen.id}.jsx</span>
        </span>
        <span className="wf-screen-chrome-actions">
          {onToggleExpand ? (
            <button
              type="button"
              className="wf-expand-one"
              onClick={(event) => {
                event.stopPropagation()
                onToggleExpand()
              }}
            >
              {expanded ? '收起' : '展开'}
            </button>
          ) : null}
          {mode === 'canvas' && onExport ? (
            <button
              type="button"
              className="wf-export-one"
              onClick={(event) => {
                event.stopPropagation()
                onExport()
              }}
            >
              导出 PNG
            </button>
          ) : null}
        </span>
      </div>
      <div
        ref={contentRef}
        className={`wf-screen-content${dragScrolling ? ' is-drag-scrolling' : ''}${expanded ? ' is-expanded' : ''}`}
        style={contentStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClick={onContentClick}
      >
        <ErrorBoundary
          scope="screen"
          resetKey={screen.id}
          screenId={screen.id}
          source={`src/screens/${screen.id}.jsx`}
        >
          <ScreenIdentityProvider screenId={screen.id}>
            <Component />
          </ScreenIdentityProvider>
        </ErrorBoundary>
      </div>
    </section>
  )
}
