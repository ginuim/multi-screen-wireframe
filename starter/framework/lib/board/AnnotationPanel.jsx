import {
  annotationProjectId,
  buildAnnotationSyncPrompt,
  createAnnotationExport,
  parseAnnotationImport,
} from './annotations.js'

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

function makeAnnotationId() {
  if (globalThis.crypto?.randomUUID) return `note-${globalThis.crypto.randomUUID()}`
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function fallbackPosition(selection) {
  const elementRect = selection?.element?.getBoundingClientRect?.()
  const rootRect = selection?.contentRoot?.getBoundingClientRect?.()
  if (!elementRect || !rootRect || !rootRect.width || !rootRect.height) return undefined
  return {
    x: Math.max(0, Math.min(1, (elementRect.right - rootRect.left) / rootRect.width)),
    y: Math.max(0, Math.min(1, (elementRect.top - rootRect.top) / rootRect.height)),
  }
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // 给 file:// 与较慢浏览器足够时间接管 Blob 下载，再释放 URL。
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

function AnnotationItem({ annotation, pending, onUpsert, onDelete }) {
  const [editing, setEditing] = React.useState(false)
  const [content, setContent] = React.useState(annotation.content)

  React.useEffect(() => setContent(annotation.content), [annotation.content])

  const commit = () => {
    const normalized = content.trim()
    if (!normalized) return
    onUpsert({ ...annotation, content: normalized, updatedAt: new Date().toISOString() })
    setEditing(false)
  }

  return (
    <li className="wf-annotation-item">
      <div className="wf-annotation-item-meta">
        <strong>{annotation.screenTitle}</strong>
        <span>{annotation.anchor.kind === 'node' ? '模块注释' : '页面注释'}</span>
        {pending ? <span className="wf-annotation-pending">待同步</span> : <span>原型内置</span>}
      </div>
      {annotation.anchor.kind === 'node' ? (
        <code className="wf-annotation-selector">{annotation.anchor.selector}</code>
      ) : null}
      {editing ? (
        <>
          <textarea
            className="wf-annotation-edit"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="wf-annotation-item-actions">
            <button type="button" onClick={commit} disabled={!content.trim()}>保存</button>
            <button type="button" onClick={() => {
              setContent(annotation.content)
              setEditing(false)
            }}>取消</button>
          </div>
        </>
      ) : (
        <p className="wf-annotation-content">{annotation.content}</p>
      )}
      {!editing ? (
        <div className="wf-annotation-item-actions">
          <button type="button" onClick={() => setEditing(true)}>编辑</button>
          <button type="button" onClick={() => onDelete(annotation.id)}>删除</button>
        </div>
      ) : null}
    </li>
  )
}

export function AnnotationPanel({
  project,
  visible = true,
  selection,
  currentScreenId,
  annotations,
  operations,
  storageSaved,
  onAdd,
  onUpsert,
  onDelete,
  onImport,
  onClearDraft,
  onClearSelection,
  onClose,
}) {
  const selectedScreenId = selection?.screenId || currentScreenId || project.screens[0]?.id
  const [scope, setScope] = React.useState(selection ? 'node' : 'screen')
  const [screenId, setScreenId] = React.useState(selectedScreenId)
  const [content, setContent] = React.useState('')
  const [filter, setFilter] = React.useState('current')
  const [message, setMessage] = React.useState('')
  const generatedPrompt = React.useMemo(
    () => buildAnnotationSyncPrompt(project, operations),
    [operations, project],
  )
  const [prompt, setPrompt] = React.useState(generatedPrompt)
  const [promptDirty, setPromptDirty] = React.useState(false)
  const [clearArmed, setClearArmed] = React.useState(false)
  const inputRef = React.useRef(null)

  React.useEffect(() => {
    setScreenId(selectedScreenId)
    if (selection) setScope('node')
  }, [selectedScreenId, selection])

  React.useEffect(() => {
    if (!promptDirty) setPrompt(generatedPrompt)
  }, [generatedPrompt, promptDirty])

  React.useEffect(() => {
    if (!clearArmed) return undefined
    const timer = window.setTimeout(() => setClearArmed(false), 5000)
    return () => window.clearTimeout(timer)
  }, [clearArmed])

  const activeScreen = project.screens.find((screen) => screen.id === screenId) || project.screens[0]
  const pendingIds = new Set((operations || []).map((operation) => (
    operation.op === 'delete' ? operation.id : operation.annotation?.id
  )))
  const visibleAnnotations = annotations.filter((annotation) => {
    if (filter === 'current') return annotation.screenId === selectedScreenId
    return true
  })

  const add = () => {
    const normalized = content.trim()
    if (!normalized || !activeScreen) return
    const useNode = scope === 'node' && selection
    const now = new Date().toISOString()
    onAdd({
      id: makeAnnotationId(),
      screenId: useNode ? selection.screenId : activeScreen.id,
      screenTitle: useNode ? selection.screenTitle : activeScreen.title,
      anchor: useNode
        ? {
          kind: 'node',
          selector: selection.selector,
          fallbackPosition: fallbackPosition(selection),
        }
        : { kind: 'screen' },
      content: normalized,
      createdAt: now,
      updatedAt: now,
    })
    setContent('')
    setMessage('注释已保存在本机，等待同步到原型。')
  }

  const exportReview = () => {
    const file = createAnnotationExport(project, annotations, operations)
    downloadJson(`${annotationProjectId(project)}.wireframe-annotations.json`, file)
    setMessage(`已导出 ${annotations.length} 条注释。`)
  }

  const importReview = async (file) => {
    if (!file) return
    try {
      const parsed = parseAnnotationImport(await file.text(), project)
      onImport(parsed.annotations, parsed.operations)
      setMessage(`已导入并合并 ${parsed.annotations.length} 条注释。`)
    } catch (error) {
      setMessage(error?.message || '导入失败。')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <aside className="wf-review-panel wf-annotation-panel" aria-label="原型注释" hidden={!visible}>
      <header className="wf-review-panel-header">
        <div className="wf-review-panel-heading">
          <strong className="wf-review-panel-title">原型注释</strong>
          <span className="wf-review-panel-count">{annotations.length} 条注释</span>
        </div>
        <button type="button" className="wf-review-close" onClick={onClose}>关闭</button>
      </header>

      <div className="wf-review-panel-body">
        <section className="wf-review-section">
          <h2 className="wf-review-section-heading">添加注释</h2>
          <div className="wf-annotation-scope" role="group" aria-label="注释范围">
            <button
              type="button"
              className={scope === 'screen' ? 'is-active' : ''}
              onClick={() => setScope('screen')}
            >页面</button>
            <button
              type="button"
              className={scope === 'node' ? 'is-active' : ''}
              disabled={!selection}
              onClick={() => setScope('node')}
            >所选模块</button>
          </div>
          {scope === 'node' && selection ? (
            <div className="wf-annotation-target">
              <span>{selection.screenTitle}</span>
              <code>{selection.selector}</code>
              <button type="button" onClick={onClearSelection}>取消选择</button>
            </div>
          ) : (
            <label className="wf-review-field">
              <span className="wf-review-field-label">页面</span>
              <select value={screenId} onChange={(event) => setScreenId(event.target.value)}>
                {project.screens.map((screen) => (
                  <option value={screen.id} key={screen.id}>{screen.title} · {screen.id}</option>
                ))}
              </select>
            </label>
          )}
          <label className="wf-review-field">
            <span className="wf-review-field-label">注释内容</span>
            <textarea
              value={content}
              placeholder={scope === 'node' ? '说明、提问或记录这个模块的设计决策' : '说明、提问或记录整个页面的设计决策'}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>
          <button type="button" className="wf-review-add" disabled={!content.trim()} onClick={add}>
            添加并保存到本机
          </button>
          <p className={`wf-annotation-save-state${storageSaved ? '' : ' is-error'}`}>
            {storageSaved ? `${operations.length} 条本机变更待同步` : '浏览器无法保存本机草稿，请先导出注释 JSON'}
          </p>
        </section>

        <section className="wf-review-section">
          <div className="wf-review-section-title">
            <h2 className="wf-review-section-heading">注释列表</h2>
            <div className="wf-annotation-filters">
              <button type="button" className={filter === 'current' ? 'is-active' : ''} onClick={() => setFilter('current')}>当前页</button>
              <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>全部</button>
            </div>
          </div>
          {visibleAnnotations.length ? (
            <ol className="wf-annotation-items">
              {visibleAnnotations.map((annotation) => (
                <AnnotationItem
                  annotation={annotation}
                  pending={pendingIds.has(annotation.id)}
                  key={annotation.id}
                  onUpsert={onUpsert}
                  onDelete={onDelete}
                />
              ))}
            </ol>
          ) : <p className="wf-review-empty">这个范围还没有注释。</p>}
        </section>

        <section className="wf-review-section">
          <div className="wf-review-section-title">
            <h2 className="wf-review-section-heading">同步与交换</h2>
            {operations.length ? (
              <button className="wf-review-regenerate" type="button" onClick={() => {
                setPrompt(generatedPrompt)
                setPromptDirty(false)
              }}>重新生成</button>
            ) : null}
          </div>
          {operations.length ? (
            <>
              <p className="wf-review-empty">复制 Prompt 给 LLM，即可把本机变更正式写入原型源码。</p>
              <textarea
                className="wf-review-prompt wf-annotation-prompt"
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value)
                  setPromptDirty(true)
                }}
              />
              <button type="button" className="wf-review-copy" onClick={() => {
                copyText(prompt).then(() => setMessage('同步 Prompt 已复制。'))
              }}>复制同步 Prompt</button>
            </>
          ) : <p className="wf-review-empty">所有本机变更都已包含在原型内置数据中。</p>}
          <div className="wf-annotation-file-actions">
            <button type="button" onClick={exportReview}>导出注释 JSON</button>
            <button type="button" onClick={() => inputRef.current?.click()}>导入注释 JSON</button>
            {operations.length ? (
              <button type="button" onClick={() => {
                if (!clearArmed) {
                  setClearArmed(true)
                  setMessage('再次点击确认清除；原型内置注释不会受影响。')
                  return
                }
                onClearDraft()
                setClearArmed(false)
                setMessage('本机草稿已清除。')
              }}>
                {clearArmed ? '确认清除本机草稿' : '清除本机草稿'}
              </button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            className="wf-annotation-file-input"
            type="file"
            accept="application/json,.json"
            onChange={(event) => importReview(event.target.files?.[0])}
          />
          {message ? <p className="wf-annotation-message" role="status">{message}</p> : null}
        </section>
      </div>
    </aside>
  )
}
