(function loadVueGlobalScreens(global) {
  'use strict'

  const Wireframe = global.WireframeVue
  const project = Wireframe.getProject()

  function loadScript(screen) {
    const id = screen.id
    const source = screen.source || `src/screens/${id}.js`
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = source
      script.async = false
      script.dataset.screenId = id
      script.onload = () => {
        if (!Wireframe.getScreen(id)) {
          Wireframe.recordLoadFailure(id, new Error(`${source} loaded but did not register "${id}"`))
        }
        resolve()
      }
      script.onerror = () => {
        Wireframe.recordLoadFailure(id, new Error(`Unable to load ${source}`))
        resolve()
      }
      document.head.appendChild(script)
    })
  }

  async function boot() {
    for (const screen of project.screens) {
      await loadScript(screen)
    }
    Wireframe.validateRegistrations()
    if (!global.WireframeVueBoard || typeof global.WireframeVueBoard.mount !== 'function') {
      throw new Error('Vue/React Board bridge was not loaded')
    }
    global.WireframeVueBoard.mount()
  }

  boot().catch((error) => {
    console.error('[wireframe:vue-global-boot]', error)
    const root = document.getElementById('root')
    if (root) {
      root.innerHTML = ''
      const card = document.createElement('div')
      card.className = 'wf-error-card wf-boot-error'
      card.setAttribute('role', 'alert')
      const title = document.createElement('strong')
      title.textContent = 'Vue Global PoC 启动失败'
      const message = document.createElement('span')
      message.textContent = error.message || String(error)
      card.append(title, message)
      root.appendChild(card)
    }
  })
})(window)
