import { getBoardShortcuts } from './shortcuts.js'

function PanelShell({ id, title, ariaLabel, onClose, children }) {
  const closeRef = React.useRef(null)
  const returnFocusRef = React.useRef(null)

  React.useEffect(() => {
    returnFocusRef.current = document.activeElement
    closeRef.current?.focus()
    return () => returnFocusRef.current?.focus?.()
  }, [])

  return (
    <div
      className="wf-board-panel-layer"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section id={id} className="wf-board-panel" role="dialog" aria-modal="true" aria-label={ariaLabel}>
        <header className="wf-board-panel-header">
          <strong>{title}</strong>
          <button ref={closeRef} type="button" className="wf-board-panel-close" onClick={onClose} aria-label={`关闭${title}`}>关闭</button>
        </header>
        <div className="wf-board-panel-body">{children}</div>
      </section>
    </div>
  )
}

export function ShortcutHelp({
  demoAvailable,
  showCanvasIndex,
  onShowCanvasIndexChange,
  trackpadZoom,
  onTrackpadZoomChange,
  zoomSensitivity,
  onZoomSensitivityChange,
  onClose,
}) {
  const shortcuts = getBoardShortcuts()
  return (
    <PanelShell id="wf-board-utility" title="帮助 / 快捷键 / 设置" ariaLabel="帮助、快捷键与设置" onClose={onClose}>
      <dl className="wf-shortcut-list">
        {shortcuts.map((shortcut) => (
          <div className={shortcut.id === 'demo' && !demoAvailable ? 'is-disabled' : ''} key={shortcut.id}>
            <dt><kbd>{shortcut.keys}</kbd></dt>
            <dd>{shortcut.label}{shortcut.id === 'demo' && !demoAvailable ? '（当前不可用）' : ''}</dd>
          </div>
        ))}
      </dl>
      <p className="wf-board-panel-note">在输入框、文本域、下拉框和可编辑内容中不会触发普通快捷键。</p>
      <section className="wf-board-panel-section" aria-labelledby="wf-board-index-setting-title">
        <h2 id="wf-board-index-setting-title">画板设置</h2>
        <label className="wf-board-setting-row">
          <span>
            <strong>显示画板索引</strong>
            <small>在画板上显示可拖拽的页面索引</small>
          </span>
          <input
            type="checkbox"
            checked={showCanvasIndex}
            onChange={(event) => onShowCanvasIndexChange(event.target.checked)}
          />
        </label>
        <label className="wf-board-setting-row">
          <span>
            <strong>触摸板缩放</strong>
            <small>按双指手势幅度连续缩放，避免固定档位跳变</small>
          </span>
          <input
            type="checkbox"
            checked={trackpadZoom}
            onChange={(event) => onTrackpadZoomChange(event.target.checked)}
          />
        </label>
        <label className={`wf-board-setting-range${trackpadZoom ? '' : ' is-disabled'}`}>
          <span>
            <strong>缩放灵敏度</strong>
            <output>{Math.round(zoomSensitivity * 100)}%</output>
          </span>
          <input
            type="range"
            min="0.25"
            max="2"
            step="0.05"
            value={zoomSensitivity}
            disabled={!trackpadZoom}
            onChange={(event) => onZoomSensitivityChange(Number(event.target.value))}
            aria-label="触摸板缩放灵敏度"
          />
          <small><span>更细腻</span><span>更灵敏</span></small>
        </label>
      </section>
    </PanelShell>
  )
}
