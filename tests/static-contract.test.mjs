import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

const fw = join(root, 'starter', 'framework')
assert.equal(existsSync(join(fw, 'lib', 'board')), true)
assert.equal(existsSync(join(fw, 'lib', 'core')), true)
assert.equal(existsSync(join(fw, 'lib', 'ui')), true)
assert.equal(existsSync(join(fw, 'styles', 'prototype.css')), true)
assert.equal(existsSync(join(fw, 'vendor')), true)
assert.equal(existsSync(join(fw, 'tools')), true)

for (const leaked of ['lib', 'styles', 'vendor', 'tools']) {
  assert.equal(
    existsSync(join(root, 'starter', leaked)),
    false,
    `starter/${leaked} must not exist at root; use framework/${leaked}`,
  )
}

for (const leaked of ['board', 'core', 'ui']) {
  assert.equal(
    existsSync(join(root, 'starter', 'src', leaked)),
    false,
    `starter/src/${leaked} must not exist; library code lives under framework/lib/`,
  )
}

const businessFiles = [
  ...filesUnder(join(root, 'starter', 'src')),
  ...filesUnder(join(root, 'demo', 'api-client', 'src')),
  ...filesUnder(join(root, 'demo', 'api-client', 'styles')),
  ...filesUnder(join(root, 'demo', 'travel-app', 'src')),
  ...filesUnder(join(root, 'demo', 'travel-app', 'styles')),
].filter((file) => ['.js', '.jsx', '.css'].includes(extname(file)))

const frameworkFiles = [
  ...filesUnder(join(fw, 'lib')),
  ...filesUnder(join(fw, 'styles')),
].filter((file) => ['.js', '.jsx', '.css'].includes(extname(file)))

const sourceFiles = [...businessFiles, ...frameworkFiles]

const demoMode = readFileSync(join(fw, 'lib', 'board', 'DemoMode.jsx'), 'utf8')
const canvasMode = readFileSync(join(fw, 'lib', 'board', 'CanvasMode.jsx'), 'utf8')
const board = readFileSync(join(fw, 'lib', 'board', 'Board.jsx'), 'utf8')
const screenFrame = readFileSync(join(fw, 'lib', 'board', 'ScreenFrame.jsx'), 'utf8')
assert.match(demoMode, /useWheelZoom/)
assert.match(demoMode, /clampScale|useWheelZoom/)
assert.doesNotMatch(demoMode, /onWheel=\{/)
assert.match(canvasMode, /useWheelZoom/)
assert.doesNotMatch(canvasMode, /onWheel=\{/)
const wheelZoom = readFileSync(join(fw, 'lib', 'board', 'useWheelZoom.js'), 'utf8')
assert.match(wheelZoom, /passive:\s*false/)
assert.match(demoMode, /wf-demo-stage/)
assert.match(demoMode, /isDemoBlankExitTarget/)
assert.match(demoMode, /onDoubleClick=\{exitOnBlankDoubleClick\}/)
assert.match(demoMode, /setMode\('canvas'\)/)
assert.match(demoMode, /BLANK_EXIT_HINT/)
assert.match(demoMode, /syncBlankExitHint/)
assert.match(demoMode, /onMouseMove=\{syncBlankExitHint\}/)
assert.doesNotMatch(demoMode, /title="双击空白处退出演示"/)
assert.match(demoMode, /panFromDragSnapshot/)
assert.match(canvasMode, /panFromDragSnapshot/)
assert.match(canvasMode, /sidebarCollapsed/)
assert.match(canvasMode, /wf-sidebar-expand/)
assert.match(canvasMode, /wf-sidebar-toggle/)
assert.doesNotMatch(demoMode, /drag\.current\.panX/)
assert.doesNotMatch(canvasMode, /drag\.current\.panX/)
assert.doesNotMatch(board, /screens\.filter\(\(screen\) => screen\.entry\)/)
assert.match(board, /project\.screens\.map\(\(screen, index\)/)
assert.match(screenFrame, /wf-screen-chrome-label/)
assert.match(screenFrame, /handleDelegatedFlowClick/)
assert.match(screenFrame, /wf-expand-one/)
assert.match(board, /全部展开/)
assert.match(board, /resolveExpandTargets/)
assert.match(board, /function LockIcon/)
assert.match(board, /<svg className="wf-lock-icon"/)
assert.match(board, /is-immersive/)
assert.match(board, /wf-immersive-chrome/)
assert.match(board, /immersiveToolbarExpanded/)
assert.match(board, /wf-immersive-toolbar-toggle/)
assert.match(board, /wf-immersive-action-button/)
assert.match(board, /aria-expanded=\{immersiveToolbarExpanded\}/)
assert.match(board, /收起精简工具栏/)
assert.match(board, /展开精简工具栏/)
assert.match(board, /requestBoardFullscreen/)
assert.doesNotMatch(board, /wf-lock-icon is-open/)
assert.doesNotMatch(screenFrame, /mode === 'canvas' \? \([\s\S]*wf-screen-chrome-label/)

const css = readFileSync(join(fw, 'styles', 'prototype.css'), 'utf8')
assert.match(css, /\.wf-tab-bar\s*\{[^}]*margin-top:\s*auto/s)
assert.match(css, /\.wf-mobile-shell\s*\{/)
assert.match(css, /\.wf-board\.is-immersive/)
assert.match(css, /\.wf-immersive-chrome/)
assert.match(css, /\.wf-immersive-chrome\.is-collapsed/)
assert.match(css, /\.wf-immersive-controls/)
assert.match(css, /\.wf-immersive-toolbar-toggle/)
assert.match(css, /\.wf-immersive-action-button/)
assert.match(css, /\.wf-canvas-screen\s*\{[^}]*position:\s*relative/s)
assert.match(css, /\.wf-screen-meta\s*\{[^}]*position:\s*absolute[^}]*bottom:\s*calc\(100% \+ 10px\)/s)
assert.doesNotMatch(css, /\.wf-lock-icon::before/)

for (const file of businessFiles) {
  const source = readFileSync(file, 'utf8')
  assert.doesNotMatch(source, /<svg\b/i, `${file} must not contain semantic SVG`)
}

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')
  assert.doesNotMatch(source, /[←›✓⌂😀-🙏]/u, `${file} contains a prohibited icon glyph`)
  assert.doesNotMatch(source, /position\s*:\s*fixed/i, `${file} contains fixed positioning`)
}

for (const demo of ['api-client', 'travel-app']) {
  assert.equal(existsSync(join(root, 'demo', demo, 'tools')), false)
  const dist = readFileSync(join(root, 'demo', demo, 'dist', 'app.js'), 'utf8')
  assert.match(dist, /^\/\* GENERATED FILE\. EDIT src\/, THEN RUN BUILD\. \*\//)
  assert.match(dist, /sourceMappingURL=data:application\/json;base64/)
  const html = readFileSync(join(root, 'demo', demo, 'index.html'), 'utf8')
  assert.match(html, /WIREFRAME_VENDOR_BASE\s*=\s*new URL\('\.\.\/\.\.\/starter\/framework\/vendor\/'/)
}

const starterHtml = readFileSync(join(root, 'starter', 'index.html'), 'utf8')
assert.match(starterHtml, /WIREFRAME_VENDOR_BASE\s*=\s*new URL\('framework\/vendor\/'/)
assert.match(starterHtml, /framework\/styles\/prototype\.css/)

for (const [indexPath, vendorPath] of [
  [join(root, 'starter', 'index.html'), 'framework/vendor/'],
  [join(root, 'demo', 'api-client', 'index.html'), '../../starter/framework/vendor/'],
  [join(root, 'demo', 'travel-app', 'index.html'), '../../starter/framework/vendor/'],
]) {
  const vendorBase = new URL(vendorPath, pathToFileURL(indexPath))
  for (const file of ['html2canvas.min.js', 'jszip.min.js', 'FileSaver.min.js']) {
    assert.equal(existsSync(fileURLToPath(new URL(file, vendorBase))), true, `${indexPath} resolves ${file}`)
  }
}

const readme = readFileSync(join(root, 'README.md'), 'utf8')
assert.match(readme, /VERSION/)
assert.match(readme, /1\.3\.0|Skill 版本/)
assert.match(readme, /framework/)

const apiClientProject = readFileSync(join(root, 'demo', 'api-client', 'src', 'project.js'), 'utf8')
const claimsProject = readFileSync(join(root, 'demo', 'travel-app', 'src', 'project.js'), 'utf8')
assert.equal((apiClientProject.match(/\bid:\s*'/g) || []).length, 6)
assert.equal((claimsProject.match(/\bid:\s*'/g) || []).length, 10)

console.log('static-contract: pass')
