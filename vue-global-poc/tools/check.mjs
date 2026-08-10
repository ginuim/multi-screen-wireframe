import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const projectSource = await readFile(join(root, 'src/project.js'), 'utf8')
let project = null

runInNewContext(projectSource, {
  WireframeVue: {
    defineProject(value) {
      project = value
    },
  },
})

assert.ok(project, 'src/project.js must call WireframeVue.defineProject()')
assert.ok(Array.isArray(project.screens) && project.screens.length > 0, 'project.screens must not be empty')

const screens = Array.from(project.screens)
const ids = screens.map((screen) => screen.id)
assert.equal(new Set(ids).size, ids.length, 'screen ids must be unique')

const screenFiles = (await readdir(join(root, 'src/screens')))
  .filter((name) => name.endsWith('.js') && name !== '_template.js')
  .sort()
const expectedFiles = ids.map((id) => `${id}.js`).sort()
assert.deepEqual(screenFiles, expectedFiles, 'project screens and src/screens files must match exactly')

for (const id of ids) {
  assert.match(id, /^[a-z0-9-]+$/, `invalid screen id: ${id}`)
  const source = await readFile(join(root, 'src/screens', `${id}.js`), 'utf8')
  assert.doesNotMatch(source, /^\s*(?:import|export)\s/m, `${id}.js must not use ESM`)
  assert.match(source, new RegExp(`WireframeVue\\.defineScreen\\(['\"]${id}['\"]`), `${id}.js must register the same id`)
  new Function(source)
}

for (const screen of screens) {
  assert.ok(Array.isArray(screen.links), `${screen.id}.links must be an array`)
  for (const target of screen.links) {
    assert.ok(ids.includes(target), `${screen.id} links to missing screen ${target}`)
  }
}

const allFiles = await readdir(join(root, 'framework'), { recursive: true })
assert.ok(!allFiles.some((name) => /esbuild|\.wasm$/i.test(name)), 'PoC must not contain esbuild or WASM')
assert.ok(allFiles.includes('runtime/board.js'), 'prebuilt board bridge is missing')

console.log(`vue-global-poc: pass (${ids.length} screens)`)
