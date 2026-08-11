import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkProject } from '../scripts/check-project.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const starter = join(root, 'starter')
const version = (await readFile(join(root, 'VERSION'), 'utf8')).trim()
const packageState = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
assert.equal(packageState.name, 'multi-screen-wireframe-vue-global', 'package name is stale')
assert.equal(packageState.version, version, 'VERSION and package.json must match')

const skillSource = await readFile(join(root, 'SKILL.md'), 'utf8')
const frontmatter = skillSource.match(/^---\n([\s\S]*?)\n---/)
assert.ok(frontmatter, 'SKILL.md frontmatter is missing')
const frontmatterKeys = [...frontmatter[1].matchAll(/^([a-z_]+):/gm)].map((match) => match[1]).sort()
assert.deepEqual(frontmatterKeys, ['description', 'name'], 'SKILL.md frontmatter may only contain name and description')
assert.match(frontmatter[1], /^name: multi-screen-wireframe-vue-global$/m, 'SKILL.md name is stale')
assert.match(skillSource, new RegExp(`multi-screen-wireframe-vue-global@${version.replaceAll('.', '\\.')}`), 'SKILL.md version example is stale')

const agentSource = await readFile(join(root, 'agents/openai.yaml'), 'utf8')
assert.match(agentSource, /\$multi-screen-wireframe-vue-global/, 'agents/openai.yaml default prompt must mention the skill')

const results = []
results.push(await checkProject(starter))
results.push(await checkProject(join(root, 'demo/api-client'), {
  frameworkDirectory: join(starter, 'framework'),
  delivery: false,
}))
results.push(await checkProject(join(root, 'demo/travel-app'), {
  frameworkDirectory: join(starter, 'framework'),
  delivery: false,
}))
results.push(await checkProject(root, { allowMaintenanceSource: true }))

async function relativeFiles(directory) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name !== '.DS_Store')
    .map((entry) => join(entry.parentPath, entry.name).slice(directory.length + 1))
    .sort()
}

async function assertMirrored(relativeDirectory) {
  const previewDirectory = join(root, relativeDirectory)
  const starterDirectory = join(starter, relativeDirectory)
  const previewFiles = await relativeFiles(previewDirectory)
  const starterFiles = await relativeFiles(starterDirectory)
  assert.deepEqual(previewFiles, starterFiles, `${relativeDirectory} preview and starter file lists differ`)
  for (const file of previewFiles) {
    const previewContent = await readFile(join(previewDirectory, file))
    const starterContent = await readFile(join(starterDirectory, file))
    assert.deepEqual(previewContent, starterContent, `${relativeDirectory}/${file} differs between preview and starter`)
  }
}

await assertMirrored('src')

const starterFrameworkFiles = await relativeFiles(join(starter, 'framework'))
assert.ok(!starterFrameworkFiles.some((file) => /\.(?:jsx|tsx|ts)$/i.test(file)), 'starter framework contains maintenance source')
for (const file of starterFrameworkFiles) {
  const previewContent = await readFile(join(root, 'framework', file))
  const starterContent = await readFile(join(starter, 'framework', file))
  assert.deepEqual(previewContent, starterContent, `framework/${file} differs between maintenance source and starter`)
}

for (const demoName of ['api-client', 'travel-app']) {
  const html = await readFile(join(root, 'demo', demoName, 'index.html'), 'utf8')
  assert.match(html, /\.\.\/\.\.\/starter\/framework\//, `${demoName} must share starter/framework`)
  assert.doesNotMatch(html, /\.\.\/\.\.\/framework\//, `${demoName} still references the preview framework`)
}

const starterNames = await readdir(starter)
assert.ok(!starterNames.includes('SKILL.md'), 'starter must not contain Skill authoring files')
assert.ok(!starterNames.includes('scripts') && !starterNames.includes('tools'), 'starter must not contain maintenance tools')

const totalScreens = results.slice(0, 3).reduce((sum, result) => sum + result.screenCount, 0)
console.log(`vue-global skill: pass (${results.length - 1} deliverable/demo projects, ${totalScreens} screens, v${version})`)
