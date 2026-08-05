import assert from 'node:assert/strict'
import {
  captureScreen,
  exportSelected,
  loadExportLibraries,
} from '../starter/lib/board/export.js'

const downloads = []
const bodyNodes = []
const headNodes = []
const loadedSources = []
let failNextScript = true

globalThis.window = {
  WIREFRAME_VENDOR_BASE: 'file:///wireframe/shared/vendor/',
}
globalThis.document = {
  baseURI: 'file:///wireframe/demo/index.html',
  querySelector(selector) {
    const file = selector.match(/="([^"]+)"/)?.[1]
    return headNodes.find((node) => node.dataset.wireframeExport === file) || null
  },
  createElement(tag) {
    if (tag === 'script') {
      return {
        dataset: {},
        remove() {
          const index = headNodes.indexOf(this)
          if (index >= 0) headNodes.splice(index, 1)
        },
      }
    }
    return {
      className: '',
      style: {},
      appendChild(child) { this.child = child },
      remove() {
        const index = bodyNodes.indexOf(this)
        if (index >= 0) bodyNodes.splice(index, 1)
      },
    }
  },
  head: {
    appendChild(script) {
      headNodes.push(script)
      loadedSources.push(script.src)
      if (failNextScript) {
        failNextScript = false
        queueMicrotask(script.onerror)
        return
      }
      if (script.src.endsWith('html2canvas.min.js')) {
        window.html2canvas = async () => ({
          toBlob(callback) { callback(new Blob(['png'], { type: 'image/png' })) },
        })
      }
      if (script.src.endsWith('jszip.min.js')) {
        window.JSZip = class {
          constructor() { this.files = [] }
          file(name, blob) { this.files.push({ name, blob }) }
          async generateAsync() { return new Blob([String(this.files.length)]) }
        }
      }
      if (script.src.endsWith('FileSaver.min.js')) {
        window.saveAs = (blob, name) => downloads.push({ blob, name })
      }
      queueMicrotask(script.onload)
    },
  },
  body: {
    appendChild(node) { bodyNodes.push(node) },
  },
}

await assert.rejects(loadExportLibraries(), /html2canvas/)
assert.equal(headNodes.length, 0)

const retryLoad = loadExportLibraries()
const sharedRetry = loadExportLibraries()
assert.equal(retryLoad, sharedRetry)
await retryLoad
assert.equal(loadedSources[0], 'file:///wireframe/shared/vendor/html2canvas.min.js')
assert.equal(loadedSources[1], 'file:///wireframe/shared/vendor/html2canvas.min.js')

const element = {
  cloneNode() {
    return { style: {} }
  },
}
const viewport = { width: 375, height: 812 }
const blob = await captureScreen(element, viewport)
assert.equal(blob.type, 'image/png')
assert.equal(bodyNodes.length, 0)

await exportSelected([{ id: 'home', element, viewport, projectName: 'Demo' }])
assert.equal(downloads[0].name, 'home.png')

await exportSelected([
  { id: 'home', element, viewport, projectName: 'Demo Project' },
  { id: 'detail', element, viewport, projectName: 'Demo Project' },
])
assert.equal(downloads[1].name, 'demo-project.zip')
assert.equal(await downloads[1].blob.text(), '2')

console.log('export: pass')
