import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  annotationStorageKey,
  applyAnnotationOperations,
  buildAnnotationSyncPrompt,
  createAnnotationExport,
  deleteAnnotationOperation,
  parseAnnotationImport,
  preventUnsavedAnnotationExit,
  readAnnotationDraft,
  reconcileAnnotationOperations,
  saveAnnotationDraft,
  upsertAnnotationOperation,
  UNSAVED_ANNOTATION_MESSAGE,
} from '../starter/framework/lib/board/annotations.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const project = {
  id: 'orders',
  name: '订单原型',
  annotationsRevision: 'annotations-r1',
  annotations: [
    {
      id: 'note-built-in',
      screenId: 'order-detail',
      screenTitle: '订单详情',
      anchor: { kind: 'screen' },
      content: '内置页面说明',
      createdAt: '2026-08-11T01:00:00.000Z',
      updatedAt: '2026-08-11T01:00:00.000Z',
    },
  ],
}

const local = {
  id: 'note-local',
  screenId: 'order-detail',
  screenTitle: '订单详情',
  anchor: {
    kind: 'node',
    selector: '#order-detail-summary',
    fallbackPosition: { x: 0.75, y: 0.2 },
  },
  content: '确认优惠明细',
  createdAt: '2026-08-11T02:00:00.000Z',
  updatedAt: '2026-08-11T02:00:00.000Z',
}

let operations = upsertAnnotationOperation(project.annotations, [], local)
assert.equal(operations.length, 1)
assert.equal(applyAnnotationOperations(project.annotations, operations).length, 2)

const edited = { ...local, content: '确认优惠与税费明细', updatedAt: '2026-08-11T03:00:00.000Z' }
operations = upsertAnnotationOperation(project.annotations, operations, edited)
assert.equal(operations.length, 1, 'upserts for the same id compact')
assert.equal(applyAnnotationOperations(project.annotations, operations)[1].content, '确认优惠与税费明细')

operations = deleteAnnotationOperation(project.annotations, operations, local.id)
assert.deepEqual(operations, [], 'deleting an unsynced add removes its operation')

operations = deleteAnnotationOperation(project.annotations, [], 'note-built-in')
assert.deepEqual(operations, [{ op: 'delete', id: 'note-built-in' }])
assert.deepEqual(applyAnnotationOperations(project.annotations, operations), [])

const storageValues = new Map()
const storage = {
  getItem: (key) => storageValues.get(key) || null,
  setItem: (key, value) => storageValues.set(key, value),
  removeItem: (key) => storageValues.delete(key),
}
assert.equal(saveAnnotationDraft(storage, project, operations), true)
assert.ok(storageValues.has(annotationStorageKey(project)))
assert.deepEqual(readAnnotationDraft(storage, project).operations, operations)
assert.equal(saveAnnotationDraft(storage, project, []), true)
assert.equal(storageValues.has(annotationStorageKey(project)), false)

const exportFile = createAnnotationExport(
  project,
  applyAnnotationOperations(project.annotations, [{ op: 'upsert', annotation: local }]),
  [{ op: 'upsert', annotation: local }],
)
const imported = parseAnnotationImport(JSON.stringify(exportFile), project)
assert.equal(imported.annotations.length, 2)
assert.equal(imported.operations.length, 1)
assert.throws(
  () => parseAnnotationImport(JSON.stringify({ ...exportFile, projectId: 'another' }), project),
  /其他项目/,
)

const syncedProject = { ...project, annotationsRevision: 'annotations-r2', annotations: [...project.annotations, local] }
assert.deepEqual(
  reconcileAnnotationOperations(syncedProject.annotations, [{ op: 'upsert', annotation: local }]),
  [],
  'operations already included in a rebuilt project are cleared',
)

const prompt = buildAnnotationSyncPrompt(project, [{ op: 'upsert', annotation: local }])
assert.match(prompt, /src\/annotations\.js/)
assert.match(prompt, /只修改业务 src\//)
assert.match(prompt, /note-local/)
assert.match(prompt, /幂等合并/)

const beforeUnloadEvent = {
  defaultPrevented: false,
  returnValue: undefined,
  preventDefault() { this.defaultPrevented = true },
}
assert.equal(preventUnsavedAnnotationExit(beforeUnloadEvent), UNSAVED_ANNOTATION_MESSAGE)
assert.equal(beforeUnloadEvent.defaultPrevented, true)
assert.match(beforeUnloadEvent.returnValue, /注释草稿.*丢失/)

const board = readFileSync(join(root, 'starter/framework/lib/board/Board.jsx'), 'utf8')
const panel = readFileSync(join(root, 'starter/framework/lib/board/AnnotationPanel.jsx'), 'utf8')
const markers = readFileSync(join(root, 'starter/framework/lib/board/AnnotationMarkers.jsx'), 'utf8')
const css = readFileSync(join(root, 'starter/framework/styles/prototype.css'), 'utf8')
const source = readFileSync(join(root, 'starter/src/annotations.js'), 'utf8')

assert.match(board, /<AnnotationPanel/)
assert.match(board, /<AnnotationMarkers/)
assert.match(board, /ToolbarIcon name="comment"/)
assert.match(board, /saveAnnotationDraft/)
assert.match(panel, /添加并保存到本机/)
assert.match(panel, /复制同步 Prompt/)
assert.match(panel, /导出注释 JSON/)
assert.match(panel, /导入注释 JSON/)
assert.match(panel, /wireframe-annotations\.json/)
assert.doesNotMatch(panel, /解决|重新打开|已解决/)
assert.match(markers, /is-orphaned/)
assert.match(markers, /fallbackPosition/)
assert.match(markers, /wf-annotation-marker-more/)
assert.doesNotMatch(markers, /onResolve|>解决</)
assert.match(css, /\.wf-annotation-marker\s*\{/)
assert.match(css, /rgba\(96, 165, 250/)
assert.match(source, /annotationsRevision/)
assert.match(source, /export const annotations = \[\]/)

function zIndexFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escaped}\\s*\\{[^}]*z-index:\\s*(\\d+)`, 's'))
  assert.ok(match, `missing z-index for ${selector}`)
  return Number(match[1])
}

const annotationZ = zIndexFor('.wf-annotation-markers')
assert.ok(annotationZ < zIndexFor('.wf-screen-sidebar'))
assert.ok(annotationZ < zIndexFor('.wf-board-toolbar'))
assert.ok(annotationZ < zIndexFor('.wf-canvas-index'))

console.log('annotations-contract: pass')
