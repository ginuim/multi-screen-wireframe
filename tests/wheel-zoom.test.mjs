import assert from 'node:assert/strict'
import { bindWheelZoom } from '../starter/lib/board/useWheelZoom.js'

const listeners = []
const el = {
  addEventListener(type, handler, options) {
    listeners.push({ type, handler, options })
  },
  removeEventListener(type, handler) {
    const index = listeners.findIndex((item) => item.type === type && item.handler === handler)
    if (index >= 0) listeners.splice(index, 1)
  },
}

let scale = 1
const scales = []
const cleanup = bindWheelZoom(
  el,
  () => scale,
  (next) => {
    scale = next
    scales.push(next)
  },
)

assert.equal(listeners.length, 1)
assert.equal(listeners[0].type, 'wheel')
assert.deepEqual(listeners[0].options, { passive: false })

let prevented = false
listeners[0].handler({
  target: el,
  deltaY: 100,
  deltaX: 0,
  ctrlKey: false,
  metaKey: false,
  preventDefault() { prevented = true },
})
assert.equal(prevented, false)
assert.equal(scales.length, 0)

listeners[0].handler({
  target: el,
  deltaY: 100,
  deltaX: 0,
  ctrlKey: true,
  metaKey: false,
  preventDefault() { prevented = true },
})
assert.equal(prevented, true)
assert.equal(scales.length, 1)
assert.ok(scales[0] < 1)

cleanup()
assert.equal(listeners.length, 0)

console.log('wheel-zoom: pass')
