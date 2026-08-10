const TYPE_LABELS = {
  comment: '修改建议',
  text: '修改文字',
  order: '调整顺序',
  remove: '删除节点',
}

function escapeSelectorToken(value) {
  if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value))
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`)
}

function escapeAttributeValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function classesOf(element) {
  if (!element?.classList) return []
  return Array.from(element.classList).filter(Boolean)
}

export function isBusinessClassName(name) {
  return !!name && !name.startsWith('wf-') && !name.startsWith('is-')
}

function selectorScope(screenId) {
  return `[data-screen-id="${escapeAttributeValue(screenId)}"]`
}

function selectorIsUnique(screenRoot, selector) {
  try {
    return screenRoot.querySelectorAll(selector).length === 1
  } catch {
    return false
  }
}

function elementSegment(element) {
  const tag = (element.tagName || 'div').toLowerCase()
  const classes = classesOf(element)
  const business = classes.filter(isBusinessClassName)
  const usable = business.length > 0 ? business : classes.filter((name) => !name.startsWith('is-'))
  const classPart = usable.slice(0, 2).map((name) => `.${escapeSelectorToken(name)}`).join('')
  const key = element.getAttribute?.('data-wf-key')
  const keyPart = key ? `[data-wf-key="${escapeAttributeValue(key)}"]` : ''
  return `${tag}${classPart}${keyPart}`
}

export function buildReviewSelector(element, contentRoot, screenId) {
  if (!element || !contentRoot || !screenId) return ''
  if (element.id) return `#${escapeSelectorToken(element.id)}`

  const scope = selectorScope(screenId)
  const key = element.getAttribute?.('data-wf-key')
  const keyPart = key ? `[data-wf-key="${escapeAttributeValue(key)}"]` : ''
  const business = classesOf(element).filter(isBusinessClassName)

  for (const name of business) {
    const local = `.${escapeSelectorToken(name)}${keyPart}`
    if (selectorIsUnique(contentRoot, local)) return `${scope} ${local}`
  }

  if (business.length > 1) {
    const local = business.map((name) => `.${escapeSelectorToken(name)}`).join('') + keyPart
    if (selectorIsUnique(contentRoot, local)) return `${scope} ${local}`
  }

  const segments = []
  let current = element
  while (current && current !== contentRoot) {
    if (current.id) {
      segments.unshift(`#${escapeSelectorToken(current.id)}`)
      break
    }
    let segment = elementSegment(current)
    const parent = current.parentElement
    if (parent && parent !== contentRoot) {
      const peers = Array.from(parent.children || []).filter(
        (item) => item.tagName === current.tagName && elementSegment(item) === segment,
      )
      if (peers.length > 1) segment += `:nth-of-type(${peers.indexOf(current) + 1})`
    }
    segments.unshift(segment)
    const local = segments.join(' > ')
    if (selectorIsUnique(contentRoot, local)) return `${scope} ${local}`
    current = parent
  }

  return `${scope} ${segments.join(' > ') || elementSegment(element)}`
}

function displayLabel(element) {
  if (element.id) return `#${element.id}`
  const classes = classesOf(element)
  const semantic = classes.find(isBusinessClassName) || classes.find((name) => !name.startsWith('is-'))
  return semantic ? `.${semantic}` : (element.tagName || 'node').toLowerCase()
}

function readText(element) {
  const value = 'value' in element && typeof element.value === 'string'
    ? element.value
    : element.textContent || ''
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized
}

export function findReviewTarget(target, contentRoot) {
  let current = target?.nodeType === 1 ? target : target?.parentElement
  while (current && current !== contentRoot) {
    if (current.id || classesOf(current).length > 0) return current
    current = current.parentElement
  }
  return null
}

export function describeReviewElement(element, contentRoot, screen) {
  if (!element || !contentRoot || !screen) return null
  const ancestors = []
  let current = element
  while (current && current !== contentRoot) {
    ancestors.unshift({
      element: current,
      label: displayLabel(current),
      selector: buildReviewSelector(current, contentRoot, screen.id),
    })
    current = current.parentElement
  }

  return {
    element,
    contentRoot,
    screenId: screen.id,
    screenTitle: screen.title,
    sourceHint: `src/screens/${screen.id}.js`,
    selector: buildReviewSelector(element, contentRoot, screen.id),
    tagName: (element.tagName || '').toLowerCase(),
    classNames: classesOf(element),
    currentText: readText(element),
    ancestors,
  }
}

function itemRequest(item) {
  if (item.type === 'text') return `修改为：${item.instruction}`
  if (item.type === 'order') return `顺序要求：${item.instruction}`
  if (item.type === 'remove') return `删除要求：${item.instruction || '删除该节点，并同步清理无用代码。'}`
  return item.instruction
}

export function reviewTargets(item) {
  if (Array.isArray(item?.targets) && item.targets.length > 0) return item.targets
  if (!item?.selector) return []
  return [{
    screenId: item.screenId,
    screenTitle: item.screenTitle,
    sourceHint: item.sourceHint,
    selector: item.selector,
    currentText: item.currentText,
  }]
}

export function buildReviewPrompt(project, items) {
  const projectName = project?.name || '未命名线框原型'

  const lines = [
    `请修改线框原型「${projectName}」。`,
    '',
    '修改约束：',
    '- 只修改业务 src/；不要修改 framework/。',
    '- 通过 DOM 选择器在 src/screens/*.js 的 Vue template 中搜索对应的 id、class 或 data-wf-key。',
    '- 保留所有语义 class、关键节点 id 和重复数据节点的 data-wf-key；新增节点也遵守同一命名规则。',
    '- 修改 screen 时保留「创建基于」，并把「修改基于」及 @wireframe-skill 更新为当前 skill 版本。',
    '- 保持 project.links 为页面流的唯一边数据；不要引入 Vue Router、import/export 或构建步骤。',
    '- 完成后刷新 index.html，验证画板、演示和修改模式。',
  ]

  if (!items?.length) {
    lines.push('', '当前没有修改意见。')
    return lines.join('\n')
  }

  items.forEach((item, itemIndex) => {
    const targets = reviewTargets(item)
    lines.push('', `## 修改 ${itemIndex + 1}：${TYPE_LABELS[item.type] || TYPE_LABELS.comment}`)
    targets.forEach((target, targetIndex) => {
      const screenId = target.screenId || item.screenId
      lines.push(
        '',
        `目标 ${targetIndex + 1}：${target.screenTitle || item.screenTitle || screenId || '未命名页面'}`,
        `页面 ID：${screenId || '未知'}`,
        `源码提示：${target.sourceHint || item.sourceHint || (screenId ? `src/screens/${screenId}.js` : '请搜索选择器')}`,
        'DOM 选择器：',
        `\`${target.selector}\``,
      )
      if (target.currentText) lines.push('', '当前内容：', target.currentText)
    })
    lines.push('', '修改要求：', itemRequest(item))
  })

  lines.push(
    '',
    '## 完成标准',
    '- 逐项完成以上修改；优先修改源码提示指向的独立 screen 文件。',
    '- 不用 DOM 层级或 nth-child 替代已有的稳定业务选择器。',
    '- 刷新后检查受影响页面及其上下游跳转，确认没有 Vue 编译或运行错误。',
  )
  return lines.join('\n')
}

export const REVIEW_TYPE_LABELS = TYPE_LABELS
