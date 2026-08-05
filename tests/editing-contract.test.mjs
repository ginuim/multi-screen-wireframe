import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const starter = new URL('../starter/', import.meta.url)
const agentsUrl = new URL('./AGENTS.md', starter)
const editingUrl = new URL('./EDITING.md', starter)

assert.equal(existsSync(agentsUrl), true, 'starter/AGENTS.md is required')
assert.equal(existsSync(editingUrl), true, 'starter/EDITING.md is required')

const agents = readFileSync(agentsUrl, 'utf8')
const editing = readFileSync(editingUrl, 'utf8')

assert.match(agents, /只修改.*src\//s)
assert.match(agents, /lib\//)
assert.match(agents, /禁止修改.*dist\/app\.js/s)
assert.match(agents, /build\.command/)
assert.match(agents, /build\.cmd/)
assert.match(agents, /src\/screens\/_template\.jsx/)

assert.match(editing, /lib\/ui\/index\.js/)

for (const heading of ['页面示例', '布局示例', '导航示例', '移动端示例', '弹窗示例']) {
  assert.match(editing, new RegExp(`## ${heading}`))
}
assert.equal((editing.match(/^## .*示例$/gm) || []).length, 5)
assert.match(editing, /MobileShell/)

console.log('editing-contract: pass')
