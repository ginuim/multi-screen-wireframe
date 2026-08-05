import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { darwinEsbuild } from './test-platform.mjs'

const starter = new URL('../starter/', import.meta.url)
const build = new URL('./build.command', starter).pathname
const source = new URL('./src/app.jsx', starter)
const output = new URL('./dist/app.js', starter)
const validFixture = new URL('./fixtures/valid/app.jsx', import.meta.url)
const invalidFixture = new URL('./fixtures/invalid/app.jsx', import.meta.url)
const esbuild = darwinEsbuild(starter)

function sha(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex')
}

execFileSync(build, { stdio: 'pipe' })
const originalSource = readFileSync(source)
const originalHash = sha(output)
const built = readFileSync(output, 'utf8')
assert.match(built, /^\/\* GENERATED FILE\. EDIT src\/, THEN RUN BUILD\. \*\//)
assert.match(built, /sourceMappingURL=data:application\/json;base64/)

try {
  writeFileSync(source, readFileSync(invalidFixture))
  const failed = spawnSync(build, { encoding: 'utf8' })
  assert.notEqual(failed.status, 0)
  assert.equal(sha(output), originalHash)
} finally {
  writeFileSync(source, originalSource)
  execFileSync(build, { stdio: 'pipe' })
}

const validResult = spawnSync(esbuild, [
  validFixture.pathname,
  '--bundle',
  '--loader:.jsx=jsx',
  '--jsx-factory=React.createElement',
  '--outfile=/dev/null',
])
assert.equal(validResult.status, 0)

const invalidResult = spawnSync(esbuild, [
  invalidFixture.pathname,
  '--bundle',
  '--loader:.jsx=jsx',
  '--jsx-factory=React.createElement',
  '--outfile=/dev/null',
])
assert.notEqual(invalidResult.status, 0)

console.log('build-pipeline: pass')
