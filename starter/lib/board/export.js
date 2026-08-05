let exportLibrariesPromise

const libraries = [
  { file: 'html2canvas.min.js', ready: () => typeof window.html2canvas === 'function' },
  { file: 'jszip.min.js', ready: () => typeof window.JSZip === 'function' },
  { file: 'FileSaver.min.js', ready: () => typeof window.saveAs === 'function' },
]

function loadScript(file) {
  return new Promise((resolve, reject) => {
    let existing = document.querySelector(`script[data-wireframe-export="${file}"]`)
    if (existing) {
      if (existing.dataset.wireframeExportState === 'loaded') {
        existing.remove()
        existing = null
      }
    }
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }
    const vendorBase = window.WIREFRAME_VENDOR_BASE
    if (!vendorBase) {
      reject(new Error('未配置本地导出库路径 WIREFRAME_VENDOR_BASE'))
      return
    }
    const script = document.createElement('script')
    script.src = new URL(file, vendorBase).href
    script.dataset.wireframeExport = file
    script.dataset.wireframeExportState = 'loading'
    script.onload = () => {
      script.dataset.wireframeExportState = 'loaded'
      resolve()
    }
    script.onerror = () => {
      script.remove()
      reject(new Error(`无法加载本地导出库 ${file}`))
    }
    document.head.appendChild(script)
  })
}

export function loadExportLibraries() {
  if (!exportLibrariesPromise) {
    exportLibrariesPromise = libraries.reduce(
      (chain, library) => chain.then(async () => {
        if (!library.ready()) await loadScript(library.file)
        if (!library.ready()) throw new Error(`导出库初始化失败: ${library.file}`)
      }),
      Promise.resolve(),
    ).catch((error) => {
      exportLibrariesPromise = undefined
      throw error
    })
  }
  return exportLibrariesPromise
}

export async function captureScreen(screenElement, viewport) {
  if (!screenElement) throw new Error('找不到要导出的 screen 元素')
  await loadExportLibraries()

  const sandbox = document.createElement('div')
  sandbox.className = 'wf-export-sandbox'
  sandbox.style.width = `${viewport.width}px`
  sandbox.style.height = `${viewport.height}px`
  const clone = screenElement.cloneNode(true)
  clone.style.width = `${viewport.width}px`
  clone.style.height = `${viewport.height}px`
  sandbox.appendChild(clone)
  document.body.appendChild(sandbox)

  try {
    const canvas = await window.html2canvas(clone, {
      backgroundColor: '#ffffff',
      width: viewport.width,
      height: viewport.height,
      scale: 2,
      useCORS: false,
      logging: false,
    })
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('PNG 编码失败')),
        'image/png',
      )
    })
  } finally {
    sandbox.remove()
  }
}

function slug(value) {
  return String(value || 'wireframe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'wireframe'
}

export async function exportSelected(screens) {
  if (!Array.isArray(screens) || screens.length === 0) {
    throw new Error('至少选择一个 screen')
  }
  await loadExportLibraries()
  const captured = []
  for (const screen of screens) {
    captured.push({
      name: `${slug(screen.id)}.png`,
      blob: await captureScreen(screen.element, screen.viewport),
    })
  }

  if (captured.length === 1) {
    window.saveAs(captured[0].blob, captured[0].name)
    return
  }

  const zip = new window.JSZip()
  captured.forEach((item) => zip.file(item.name, item.blob))
  const blob = await zip.generateAsync({ type: 'blob' })
  window.saveAs(blob, `${slug(screens[0].projectName)}.zip`)
}
