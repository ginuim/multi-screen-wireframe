/**
 * Record feature walkthrough clips for Multi-Screen Wireframe promo video.
 * Each segment writes a WebM under raw/, then compose.mjs stitches with TTS.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const RAW = path.join(__dirname, 'raw')
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  path.join(process.env.HOME || '', 'Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
]
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p))
const VIEW = { width: 1440, height: 900 }

const API = pathToFileURL(path.join(ROOT, 'demo/api-client/index.html')).href
const TRAVEL = pathToFileURL(path.join(ROOT, 'demo/travel-app/index.html')).href

fs.mkdirSync(RAW, { recursive: true })

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

async function waitReady(page) {
  await page.waitForSelector('.wf-board-toolbar', { timeout: 30000 })
  await page.waitForSelector('.wf-screen-frame, .wf-demo-stage, .wf-canvas', { timeout: 30000 })
  await sleep(800)
}

async function withVideo(name, run) {
  const outDir = path.join(RAW, `_tmp_${name}`)
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })

  const launchOpts = {
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security'],
  }
  if (CHROME) launchOpts.executablePath = CHROME
  else launchOpts.channel = 'chrome'
  const browser = await chromium.launch(launchOpts)
  const context = await browser.newContext({
    viewport: VIEW,
    deviceScaleFactor: 1,
    locale: 'zh-CN',
    recordVideo: { dir: outDir, size: VIEW },
  })
  const page = await context.newPage()
  page.setDefaultTimeout(20000)

  try {
    await run(page)
  } finally {
    await context.close()
    await browser.close()
  }

  const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.webm'))
  if (!files.length) throw new Error(`No video for ${name}`)
  const dest = path.join(RAW, `${name}.webm`)
  fs.renameSync(path.join(outDir, files[0]), dest)
  fs.rmSync(outDir, { recursive: true, force: true })
  console.log('wrote', dest)
  return dest
}

async function dismissOverlays(page) {
  // Close help / settings modal if open
  const close = page.locator('.wf-board-panel-close')
  if (await close.count()) {
    await close.first().click({ force: true }).catch(() => {})
    await sleep(200)
  }
  await page.keyboard.press('Escape').catch(() => {})
  await page.evaluate(() => {
    document.querySelectorAll('.wf-board-panel-layer').forEach((el) => el.remove())
  }).catch(() => {})
  await sleep(150)
}

async function clickToolbarByLabel(page, label) {
  await dismissOverlays(page)
  await page.getByRole('button', { name: label, exact: true }).click({ force: true })
}

async function safeClick(locator) {
  if (!(await locator.count())) return false
  await locator.click({ force: true }).catch(() => {})
  return true
}

async function segmentOpen(page) {
  await page.goto(API)
  await waitReady(page)
  await sleep(2500)
}

async function segmentBoard(page) {
  await page.goto(API)
  await waitReady(page)
  // gentle pan/zoom feel: zoom out then in
  const minus = page.locator('.wf-toolbar-center button').filter({ hasText: /−|-/ }).first()
  const plus = page.locator('.wf-toolbar-center button').filter({ hasText: /\+|＋/ }).first()
  if (await minus.count()) {
    await minus.click()
    await sleep(700)
    await minus.click()
    await sleep(900)
  }
  // drag canvas if present
  const canvas = page.locator('.wf-canvas, .wf-board-canvas, .wf-canvas-surface').first()
  if (await canvas.count()) {
    const box = await canvas.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.45, { steps: 20 })
      await sleep(400)
      await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.55, { steps: 20 })
      await page.mouse.up()
    }
  }
  if (await plus.count()) {
    await plus.click()
    await sleep(600)
    await plus.click()
    await sleep(800)
  }
  await sleep(1500)
}

async function segmentDemo(page) {
  await page.goto(API)
  await waitReady(page)
  await clickToolbarByLabel(page, '演示')
  await sleep(1200)
  await dismissOverlays(page)
  const hotspot = page.getByRole('button', { name: /热区/ })
  await safeClick(hotspot)
  await sleep(1000)
  // Prefer side nav labels inside the demo shell
  const nav = page.locator('.wf-demo-stage, .wf-demo').getByText('Collection', { exact: false }).first()
  if (await nav.count()) {
    await nav.click({ force: true }).catch(() => {})
    await sleep(1400)
  }
  await dismissOverlays(page)
  await safeClick(page.getByRole('button', { name: '返回' }))
  await sleep(800)
  await dismissOverlays(page)
  await safeClick(hotspot)
  await sleep(700)
  await safeClick(hotspot)
  await sleep(1200)
}

async function segmentModify(page) {
  await page.goto(API)
  await waitReady(page)
  await clickToolbarByLabel(page, '演示')
  await sleep(600)
  await dismissOverlays(page)
  await page.locator('.wf-toolbar-icon-button[aria-label="修改"]').click({ force: true })
  await sleep(900)
  const candidates = [
    page.locator('.wf-demo-stage h1, .wf-demo-stage h2, .wf-screen-body h1, .wf-screen-body h2').first(),
    page.locator('.wf-demo-stage button, .wf-screen-body button').first(),
    page.locator('.wf-demo-stage [class*="__"]').first(),
  ]
  for (const loc of candidates) {
    if (await loc.count()) {
      await loc.click({ force: true }).catch(() => {})
      await sleep(1000)
      break
    }
  }
  const second = page.locator('.wf-demo-stage p, .wf-screen-body p, .wf-demo-stage li').first()
  await safeClick(second)
  await sleep(1000)
  const panel = page.locator('.wf-review-panel').first()
  if (await panel.count()) {
    await panel.hover().catch(() => {})
    await sleep(1200)
  }
  await sleep(1800)
}

async function segmentAnnotation(page) {
  await page.goto(API)
  await waitReady(page)
  await clickToolbarByLabel(page, '演示')
  await sleep(500)
  await dismissOverlays(page)
  await page.locator('.wf-toolbar-icon-button[aria-label="注释"]').click({ force: true })
  await sleep(900)
  const target = page.locator('.wf-demo-stage h1, .wf-demo-stage h2, .wf-demo-stage [class*="__title"]').first()
  await safeClick(target)
  await sleep(1000)
  const textarea = page.locator('.wf-annotation-panel textarea').first()
  if (await textarea.count()) {
    await textarea.fill('说明：这里是工作区入口，评审时关注侧栏与最近请求。')
    await sleep(800)
    await safeClick(page.getByRole('button', { name: /添加并保存/ }).first())
    await sleep(1000)
  }
  // scroll annotation list a bit
  const panel = page.locator('.wf-annotation-panel').first()
  if (await panel.count()) {
    await panel.evaluate((el) => { el.scrollTop = 180 }).catch(() => {})
    await sleep(1000)
  }
  await sleep(1600)
}

async function segmentHelp(page) {
  await page.goto(API)
  await waitReady(page)
  await dismissOverlays(page)
  await page.getByRole('button', { name: /帮助/ }).click({ force: true })
  await sleep(1500)
  const utility = page.locator('#wf-board-utility, .wf-board-utility, .wf-help-panel, .wf-board-panel').first()
  if (await utility.count()) {
    await utility.evaluate((el) => { el.scrollTop = 120 }).catch(() => {})
    await sleep(900)
    await utility.evaluate((el) => { el.scrollTop = 280 }).catch(() => {})
    await sleep(900)
  }
  const langSelect = page.locator('#wf-board-utility select, .wf-board-panel select').first()
  if (await langSelect.count()) {
    await langSelect.selectOption({ label: 'English' }).catch(() => {})
    await sleep(800)
    await langSelect.selectOption({ label: '简体中文' }).catch(() => {})
    await sleep(700)
  }
  await sleep(1200)
}

async function segmentMobile(page) {
  await page.goto(TRAVEL)
  await waitReady(page)
  await sleep(1600)
  await clickToolbarByLabel(page, '演示')
  await sleep(1400)
  await dismissOverlays(page)
  const tab = page.locator('.wf-demo-stage, .wf-demo').getByText(/行程|发现|我的|首页|预订/).first()
  await safeClick(tab)
  await sleep(1200)
  await safeClick(page.getByRole('button', { name: /热区/ }))
  await sleep(1500)
}

async function segmentExport(page) {
  await page.goto(API)
  await waitReady(page)
  await dismissOverlays(page)
  const downloadBtn = page.getByRole('button', { name: /打包下载|导出/ }).first()
  if (await downloadBtn.count()) {
    await downloadBtn.hover()
    await sleep(1200)
  }
  const immersive = page.getByRole('button', { name: /沉浸/ }).first()
  if (await immersive.count()) {
    await immersive.click({ force: true })
    await sleep(1400)
    await immersive.click({ force: true }).catch(() => {})
    await sleep(800)
  } else {
    await page.keyboard.press('Control+Digit3').catch(() => {})
    await sleep(1200)
    await page.keyboard.press('Control+Digit3').catch(() => {})
  }
  await sleep(1200)
}

async function segmentClose(page) {
  await page.goto(API)
  await waitReady(page)
  await sleep(1200)
  await clickToolbarByLabel(page, '演示')
  await sleep(1600)
  await clickToolbarByLabel(page, '画板')
  await sleep(2000)
}

const segments = [
  ['01-open', segmentOpen],
  ['02-board', segmentBoard],
  ['03-demo', segmentDemo],
  ['04-modify', segmentModify],
  ['05-annotation', segmentAnnotation],
  ['06-help', segmentHelp],
  ['07-mobile', segmentMobile],
  ['08-export', segmentExport],
  ['09-close', segmentClose],
]

const only = process.argv[2]
for (const [name, fn] of segments) {
  if (only && only !== name) continue
  console.log('recording', name)
  try {
    await withVideo(name, fn)
  } catch (err) {
    console.error('FAILED', name, err.message)
    process.exitCode = 1
  }
}
console.log('done')
