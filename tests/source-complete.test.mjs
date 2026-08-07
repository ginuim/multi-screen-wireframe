import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function screenIdsFromProject(projectSource) {
  const ids = []
  const re = /\bid:\s*'([a-z0-9-]+)'/g
  let match
  while ((match = re.exec(projectSource))) ids.push(match[1])
  return ids
}

function assertScreensComplete(label, projectDir) {
  const projectPath = join(projectDir, 'src', 'project.js')
  const screensDir = join(projectDir, 'src', 'screens')
  assert.equal(existsSync(projectPath), true, `${label}: missing src/project.js`)
  assert.equal(existsSync(screensDir), true, `${label}: missing src/screens`)

  const projectSource = readFileSync(projectPath, 'utf8')
  const ids = screenIdsFromProject(projectSource)
  assert.ok(ids.length > 0, `${label}: no screen ids in project.js`)

  for (const id of ids) {
    const file = join(screensDir, `${id}.jsx`)
    assert.equal(existsSync(file), true, `${label}: missing src/screens/${id}.jsx`)
    assert.match(
      projectSource,
      new RegExp(`from\\s+['"]\\.\\/screens\\/${id}\\.jsx['"]`),
      `${label}: project.js must import ./screens/${id}.jsx`,
    )
  }

  const files = readdirSync(screensDir).filter((name) => name.endsWith('.jsx') && name !== '_template.jsx')
  for (const file of files) {
    const id = file.replace(/\.jsx$/, '')
    assert.ok(ids.includes(id), `${label}: orphan screen file ${file} not listed in project.js`)
  }
}

assertScreensComplete('starter', join(root, 'starter'))
assertScreensComplete('demo/order-admin', join(root, 'demo', 'order-admin'))
assertScreensComplete('demo/claims-app', join(root, 'demo', 'claims-app'))

const skill = readFileSync(join(root, 'SKILL.md'), 'utf8')
assert.match(skill, /源码齐全/)
assert.match(skill, /样式落点/)
assert.match(skill, /framework\/styles\/prototype\.css|禁止修改 `framework\//)
assert.match(skill, /src\/styles\/app\.css/)

const agents = readFileSync(join(root, 'AGENTS.md'), 'utf8')
assert.match(agents, /framework\//)
assert.match(agents, /禁止.*framework|framework.*禁止/s)

const starterAgents = readFileSync(join(root, 'starter', 'AGENTS.md'), 'utf8')
assert.match(starterAgents, /禁止.*framework|framework\/styles\/prototype\.css/)
assert.match(starterAgents, /src\/styles\/app\.css/)
assert.match(starterAgents, /framework\/lib\/ui\/index\.js/)

const proto = readFileSync(join(root, 'starter', 'framework', 'styles', 'prototype.css'), 'utf8')
for (const banned of ['order-shell', 'demo-wide-table', 'order-login', 'order-main']) {
  assert.doesNotMatch(proto, new RegExp(banned), `prototype.css must not contain business class ${banned}`)
}

console.log('source-complete: pass')
