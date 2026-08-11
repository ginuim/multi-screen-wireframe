import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

async function checkProject(projectRoot, label) {
  const projectSource = await readFile(join(projectRoot, 'src/project.js'), 'utf8')
  let project = null
  const context = { WireframeVue: { defineProject(value) { project = value } } }
  context.window = context
  runInNewContext(projectSource, context)
  assert.ok(project, `${label}: src/project.js must call WireframeVue.defineProject()`)
  assert.ok(Array.isArray(project.screens) && project.screens.length > 0, `${label}: project.screens must not be empty`)

  const screens = Array.from(project.screens)
  const ids = screens.map((screen) => screen.id)
  assert.equal(new Set(ids).size, ids.length, `${label}: screen ids must be unique`)
  const screenFiles = (await readdir(join(projectRoot, 'src/screens')))
    .filter((name) => name.endsWith('.js') && name !== '_template.js')
    .sort()
  assert.deepEqual(screenFiles, ids.map((id) => `${id}.js`).sort(), `${label}: project screens and src/screens files must match exactly`)

  for (const id of ids) {
    assert.match(id, /^[a-z0-9-]+$/, `${label}: invalid screen id: ${id}`)
    const source = await readFile(join(projectRoot, 'src/screens', `${id}.js`), 'utf8')
    assert.doesNotMatch(source, /^\s*(?:import|export)\s/m, `${label}/${id}.js must not use ESM`)
    assert.match(source, new RegExp(`WireframeVue\\.defineScreen\\(['"]${id}['"]`), `${label}/${id}.js must register the same id`)
    new Function(source)
  }

  for (const screen of screens) {
    assert.ok(Array.isArray(screen.links), `${label}/${screen.id}.links must be an array`)
    for (const target of screen.links) assert.ok(ids.includes(target), `${label}/${screen.id} links to missing screen ${target}`)
  }

  for (const entry of project.components || []) {
    assert.match(entry.name, /^Wf[A-Z][A-Za-z0-9]*$/, `${label}: invalid component name ${entry.name}`)
    const source = await readFile(join(projectRoot, entry.source), 'utf8')
    assert.match(source, new RegExp(`defineComponent\\(['"]${entry.name}['"]`), `${label}: ${entry.source} must register ${entry.name}`)
    new Function(source)
  }
  return ids.length
}

const projects = [
  [root, 'starter'],
  [join(root, 'demo/api-client'), 'api-client'],
  [join(root, 'demo/travel-app'), 'travel-app'],
]
let screenCount = 0
for (const [projectRoot, label] of projects) screenCount += await checkProject(projectRoot, label)

const allFiles = await readdir(join(root, 'framework'), { recursive: true })
assert.ok(!allFiles.some((name) => /esbuild|\.wasm$/i.test(name)), 'PoC must not contain esbuild or WASM')
assert.ok(allFiles.includes('runtime/board.js'), 'prebuilt board bridge is missing')

console.log(`vue-global-poc: pass (${projects.length} projects, ${screenCount} screens)`)
