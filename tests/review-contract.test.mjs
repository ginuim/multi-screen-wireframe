import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildReviewPrompt,
  isBusinessClassName,
  reviewTargets,
} from '../starter/framework/lib/board/review.js'
import {
  preventUnsavedReviewExit,
  UNSAVED_REVIEW_MESSAGE,
} from '../starter/framework/lib/board/before-unload.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const version = readFileSync(join(root, 'VERSION'), 'utf8').trim()
const versionPattern = version.replace(/\./g, '\\.')

assert.equal(isBusinessClassName('order-detail__summary'), true)
assert.equal(isBusinessClassName('wf-card'), false)
assert.equal(isBusinessClassName('is-active'), false)

const prompt = buildReviewPrompt(
  { name: '订单原型' },
  [
    {
      id: 'one',
      type: 'text',
      screenId: 'order-detail',
      screenTitle: '订单详情',
      sourceHint: 'src/screens/order-detail.jsx',
      selector: '#order-detail-title',
      currentText: '订单详情',
      instruction: '订单信息',
    },
    {
      id: 'two',
      type: 'order',
      screenId: 'order-detail',
      screenTitle: '订单详情',
      sourceHint: 'src/screens/order-detail.jsx',
      selector: '.order-detail__actions',
      instruction: '移动到摘要之后',
    },
  ],
)

assert.match(prompt, /只修改业务 src\//)
assert.match(prompt, /不要修改 framework\/ 或 dist\/app\.js/)
assert.match(prompt, /#order-detail-title/)
assert.match(prompt, /修改为：订单信息/)
assert.match(prompt, /顺序要求：移动到摘要之后/)
assert.match(prompt, /data-wf-key/)

const multiItem = {
  id: 'multi',
  type: 'comment',
  targets: [
    {
      screenId: 'order-detail',
      screenTitle: '订单详情',
      sourceHint: 'src/screens/order-detail.jsx',
      selector: '#order-detail-summary',
      currentText: '订单摘要',
    },
    {
      screenId: 'order-detail',
      screenTitle: '订单详情',
      sourceHint: 'src/screens/order-detail.jsx',
      selector: '#order-detail-actions',
      currentText: '订单操作',
    },
  ],
  instruction: '这两个模块需要使用相同的标题层级',
}
const multiPrompt = buildReviewPrompt({ name: '订单原型' }, [multiItem])
assert.equal(reviewTargets(multiItem).length, 2)
assert.match(multiPrompt, /目标 1：订单详情/)
assert.match(multiPrompt, /目标 2：订单详情/)
assert.match(multiPrompt, /#order-detail-summary/)
assert.match(multiPrompt, /#order-detail-actions/)

const board = readFileSync(join(root, 'starter/framework/lib/board/Board.jsx'), 'utf8')
const frame = readFileSync(join(root, 'starter/framework/lib/board/ScreenFrame.jsx'), 'utf8')
const panel = readFileSync(join(root, 'starter/framework/lib/board/ReviewPanel.jsx'), 'utf8')
const markers = readFileSync(join(root, 'starter/framework/lib/board/ReviewMarkers.jsx'), 'utf8')
const launcher = readFileSync(join(root, 'starter/framework/lib/board/ReviewLauncher.jsx'), 'utf8')
const css = readFileSync(join(root, 'starter/framework/styles/prototype.css'), 'utf8')
const skill = readFileSync(join(root, 'SKILL.md'), 'utf8')

assert.match(board, /reviewEnabled/)
assert.match(board, /<ReviewPanel/)
assert.match(board, /<ReviewMarkers/)
assert.match(board, /const canvasLocked = !interactive \|\| spaceHeld/)
assert.match(board, /修改中/)
assert.match(board, /edit: <><path d="M12 20h9"/)
assert.match(board, /expand: <><path d="m7 15 5 5 5-5"/)
assert.match(board, /collapse: <><path d="m7 20 5-5 5 5"/)
assert.match(board, /<ToolbarIcon name="edit" \/>/)
assert.match(board, /<ReviewLauncher/)
assert.match(board, /count=\{reviewItems\.length\}/)
assert.match(board, /onOpenPanel=\{openReviewPanel\}/)
assert.match(board, /reviewItems\.length === 0/)
assert.match(board, /addEventListener\('beforeunload', preventUnsavedReviewExit\)/)
assert.match(board, /removeEventListener\('beforeunload', preventUnsavedReviewExit\)/)
assert.match(board, /<ReviewPanel[\s\S]*visible=\{reviewPanelVisible && reviewEnabled\}/)
assert.match(board, /setReviewPanelVisible\(true\)/)
assert.match(board, /const closeReviewPanel = React\.useCallback/)
assert.equal((board.match(/onCanvasClick=\{reviewPanelVisible \? closeReviewPanel : undefined\}/g) || []).length, 2)
assert.match(board, /onHoverElement=\{hoverReviewBreadcrumb\}/)
assert.match(readFileSync(join(root, 'starter/framework/lib/board/CanvasMode.jsx'), 'utf8'), /onClick=\{onCanvasClick\}/)
assert.match(readFileSync(join(root, 'starter/framework/lib/board/DemoMode.jsx'), 'utf8'), /onClick=\{onCanvasClick\}/)
assert.match(frame, /onClickCapture=\{onReviewClick\}/)
assert.match(frame, /findReviewTarget/)
assert.match(frame, /!reviewEnabled \|\| canvasLocked/)
assert.match(panel, /修改原型/)
assert.match(panel, /hidden=\{!visible\}/)
assert.match(panel, /wf-review-breadcrumb-sep/)
assert.match(panel, /onMouseEnter=\{\(\) => onHoverElement\?\.\(ancestor\.element\)\}/)
assert.match(panel, /最终 Prompt/)
assert.match(panel, /复制 Prompt/)
assert.match(panel, /多选/)
assert.match(panel, /Shift \/ Command \/ Ctrl/)
assert.match(markers, /wf-review-marker/)
assert.match(markers, /wf-review-marker-popover/)
assert.match(markers, /reviewTargets/)
assert.match(markers, /查看更多/)
assert.match(markers, /onOpenPanel\?\.\(\)/)
assert.match(launcher, /wf-review-launcher/)
assert.match(launcher, /count <= 0/)
assert.match(launcher, /localStorage/)
assert.match(launcher, /setPointerCapture/)
assert.match(css, /\.wf-review-panel\s*\{/)
assert.match(css, /\.wf-review-panel\[hidden\]\s*\{\s*display: none;/)
assert.match(css, /linear-gradient\(36deg/)
assert.match(css, /linear-gradient\(-36deg/)
assert.match(css, /\.is-review-selected/)
assert.match(css, /\.wf-review-breadcrumb-sep/)
assert.match(css, /\.wf-review-breadcrumbs button:hover/)
assert.match(css, /outline: 3px dashed #1d4ed8/)
assert.match(css, /\.wf-board\.is-reviewing \.wf-screen-chrome\s*\{/)
assert.match(css, /\.wf-board\.is-reviewing \.wf-screen-chrome\.is-focused/)
assert.match(css, /border-color: #2563eb/)
assert.match(css, /box-shadow: 0 0 0 2px #1e3a8a/)
assert.match(css, /#1d4ed8/)
assert.match(css, /\.wf-review-marker\s*\{/)
assert.match(css, /\.wf-review-launcher\s*\{/)
assert.match(css, /\.wf-review-marker-popover-more\s*\{/)
assert.match(css, /rgba\(250, 204, 21/)

function zIndexFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escaped}\\s*\\{[^}]*z-index:\\s*(\\d+)`, 's'))
  assert.ok(match, `missing z-index for ${selector}`)
  return Number(match[1])
}

const annotationZ = zIndexFor('.wf-review-markers')
assert.ok(annotationZ < zIndexFor('.wf-screen-sidebar'), 'review markers must stay below framework sidebar')
assert.ok(annotationZ < zIndexFor('.wf-board-toolbar'), 'review markers must stay below framework toolbar')
assert.ok(annotationZ < zIndexFor('.wf-canvas-index'), 'review markers must stay below framework canvas index')

const beforeUnloadEvent = {
  defaultPrevented: false,
  returnValue: undefined,
  preventDefault() {
    this.defaultPrevented = true
  },
}
assert.equal(preventUnsavedReviewExit(beforeUnloadEvent), UNSAVED_REVIEW_MESSAGE)
assert.equal(beforeUnloadEvent.defaultPrevented, true)
assert.equal(beforeUnloadEvent.returnValue, UNSAVED_REVIEW_MESSAGE)
assert.match(UNSAVED_REVIEW_MESSAGE, /修改内容.*丢失.*是否继续/)

assert.match(skill, /DOM 修改定位（必须）/)
assert.match(skill, /所有业务 JSX 节点都写语义 class/)
assert.match(skill, /关键节点写全局唯一 id/)
assert.match(skill, /data-wf-key/)
assert.match(skill, /半透明黄色编号/)
assert.match(skill, /按住空格可拖动画布/)

for (const directory of [
  join(root, 'demo/api-client/src/screens'),
  join(root, 'demo/api-client/src/layouts'),
  join(root, 'demo/travel-app/src/screens'),
  join(root, 'demo/travel-app/src/layouts'),
]) {
  for (const name of readdirSync(directory).filter((file) => file.endsWith('.jsx'))) {
    const source = readFileSync(join(directory, name), 'utf8')
    assert.match(source, new RegExp(`@wireframe-skill multi-screen-wireframe@${versionPattern}`), `${name}: current skill version comment`)
    assert.match(source, /className=/, `${name}: semantic business class`)
  }
}

for (const directory of [
  join(root, 'starter/src/screens'),
  join(root, 'demo/api-client/src/screens'),
  join(root, 'demo/travel-app/src/screens'),
]) {
  for (const name of readdirSync(directory).filter((file) => file.endsWith('.jsx'))) {
    const source = readFileSync(join(directory, name), 'utf8')
    assert.match(source, /\bid="[a-z0-9-]+"/, `${name}: important node id`)
  }
}

console.log('review-contract: pass')
