import { buildReviewPrompt, reviewTargets, REVIEW_TYPE_LABELS } from './review.js'

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text)
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'absolute'
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

export function ReviewPanel({
  project,
  visible = true,
  selections,
  multiSelect,
  items,
  onToggleMultiSelect,
  onSelectElement,
  onHoverElement,
  onRemoveSelection,
  onClearSelection,
  onAddItem,
  onRemoveItem,
  onClose,
}) {
  const selected = selections[selections.length - 1] || null
  const generatedPrompt = React.useMemo(() => buildReviewPrompt(project, items), [project, items])
  const [type, setType] = React.useState('comment')
  const [instruction, setInstruction] = React.useState('')
  const [prompt, setPrompt] = React.useState(generatedPrompt)
  const [promptDirty, setPromptDirty] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const copyTimer = React.useRef(null)

  React.useEffect(() => {
    if (!promptDirty) setPrompt(generatedPrompt)
  }, [generatedPrompt, promptDirty])

  React.useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current)
  }, [])

  const addItem = () => {
    if (selections.length === 0) return
    const normalized = instruction.trim()
    if (!normalized && type !== 'remove') return
    onAddItem({
      type,
      targets: selections.map((selection) => ({
        screenId: selection.screenId,
        screenTitle: selection.screenTitle,
        sourceHint: selection.sourceHint,
        selector: selection.selector,
        currentText: selection.currentText,
      })),
      instruction: normalized,
    })
    setInstruction('')
  }

  const regenerate = () => {
    setPrompt(generatedPrompt)
    setPromptDirty(false)
  }

  const copyPrompt = () => {
    copyText(prompt).then(() => {
      setCopied(true)
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 1400)
    })
  }

  const instructionLabel = type === 'text'
    ? '新文字'
    : type === 'order'
      ? '顺序要求'
      : type === 'remove'
        ? '删除说明（可选）'
        : '给 AI 的修改建议'

  return (
    <aside className="wf-review-panel" aria-label="修改原型" hidden={!visible}>
      <header className="wf-review-panel-header">
        <div className="wf-review-panel-heading">
          <strong className="wf-review-panel-title">修改原型</strong>
          <span className="wf-review-panel-count">{items.length} 条修改</span>
        </div>
        <button type="button" className="wf-review-close" onClick={onClose}>关闭</button>
      </header>

      <div className="wf-review-panel-body">
        <section className="wf-review-section">
          <div className="wf-review-selection-heading">
            <h2 className="wf-review-section-heading">已选节点 ({selections.length})</h2>
            <div className="wf-review-selection-actions">
              <button
                type="button"
                className={multiSelect ? 'wf-review-multi-select is-active' : 'wf-review-multi-select'}
                aria-pressed={multiSelect}
                onClick={onToggleMultiSelect}
              >
                多选 {multiSelect ? 'ON' : 'OFF'}
              </button>
              {selections.length > 0 ? (
                <button className="wf-review-clear-selection" type="button" onClick={onClearSelection}>清空</button>
              ) : null}
            </div>
          </div>
          <p className="wf-review-selection-hint">多选开启后点击节点可加入或移除；也可按住 Shift / Command / Ctrl 点击。</p>
          {selections.length > 0 ? (
            <ol className="wf-review-selections">
              {selections.map((selection, index) => (
                <li className={selection === selected ? 'wf-review-selection is-active' : 'wf-review-selection'} key={`${selection.screenId}:${selection.selector}`}>
                  <code className="wf-review-selection-selector">{index + 1}. {selection.selector}</code>
                  <button className="wf-review-selection-remove" type="button" onClick={() => onRemoveSelection(selection.element)}>移除</button>
                </li>
              ))}
            </ol>
          ) : null}
          {selected ? (
            <>
              <div className="wf-review-screen-name">{selected.screenTitle} · {selected.screenId}</div>
              <div className="wf-review-breadcrumbs" aria-label="节点层级">
                {selected.ancestors.map((ancestor, index) => (
                  <React.Fragment key={ancestor.selector}>
                    {index > 0 ? (
                      <span className="wf-review-breadcrumb-sep" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
                    ) : null}
                    <button
                      className="wf-review-breadcrumb"
                      type="button"
                      title={ancestor.selector}
                      onMouseEnter={() => onHoverElement?.(ancestor.element)}
                      onMouseLeave={() => onHoverElement?.(null)}
                      onClick={() => onSelectElement(ancestor.element)}
                    >
                      {ancestor.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <code className="wf-review-selector">{selected.selector}</code>
              {selected.currentText ? (
                <p className="wf-review-current-text">当前：{selected.currentText}</p>
              ) : null}
              <label className="wf-review-field">
                <span className="wf-review-field-label">修改类型</span>
                <select className="wf-review-type-select" value={type} onChange={(event) => setType(event.target.value)}>
                  {Object.entries(REVIEW_TYPE_LABELS).map(([value, label]) => (
                    <option className="wf-review-type-option" value={value} key={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="wf-review-field">
                <span className="wf-review-field-label">{instructionLabel}</span>
                <textarea
                  className="wf-review-instruction"
                  value={instruction}
                  placeholder={type === 'order' ? '例如：移动到订单摘要之后' : '描述希望 AI 如何修改'}
                  onChange={(event) => setInstruction(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="wf-review-add"
                disabled={!instruction.trim() && type !== 'remove'}
                onClick={addItem}
              >
                加入修改清单（{selections.length} 个节点）
              </button>
            </>
          ) : (
            <p className="wf-review-empty">点击页面中的节点开始修改。点击面包屑可切换到父级组件。</p>
          )}
        </section>

        <section className="wf-review-section">
          <h2 className="wf-review-section-heading">修改清单</h2>
          {items.length > 0 ? (
            <ol className="wf-review-items">
              {items.map((item, index) => (
                <li className="wf-review-item" key={item.id}>
                  <div className="wf-review-item-content">
                    <strong className="wf-review-item-title">{index + 1}. {REVIEW_TYPE_LABELS[item.type]}</strong>
                    <code className="wf-review-item-selector">
                      {reviewTargets(item).map((target) => target.selector).join('、')}
                    </code>
                    <p className="wf-review-item-instruction">{item.instruction || '删除该节点，并同步清理无用代码。'}</p>
                  </div>
                  <button className="wf-review-item-delete" type="button" onClick={() => onRemoveItem(item.id)}>删除</button>
                </li>
              ))}
            </ol>
          ) : <p className="wf-review-empty">还没有修改意见。</p>}
        </section>

        <section className="wf-review-section wf-review-prompt-section">
          <div className="wf-review-section-title">
            <h2 className="wf-review-section-heading">最终 Prompt</h2>
            <button className="wf-review-regenerate" type="button" onClick={regenerate}>重新生成</button>
          </div>
          {promptDirty ? <p className="wf-review-manual">Prompt 已手动修改；重新生成会覆盖手动内容。</p> : null}
          <textarea
            className="wf-review-prompt"
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value)
              setPromptDirty(true)
            }}
          />
          <button type="button" className="wf-review-copy" onClick={copyPrompt}>
            {copied ? '已复制' : '复制 Prompt'}
          </button>
        </section>
      </div>
    </aside>
  )
}
