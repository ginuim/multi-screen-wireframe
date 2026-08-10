import assert from 'node:assert/strict'
import { bindWheelZoom, nextWheelScale } from '../starter/framework/lib/board/useWheelZoom.js'

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
let locked = false
let options = {}
const cleanup = bindWheelZoom(
  el,
  () => scale,
  (next) => {
    scale = next
    scales.push(next)
  },
  () => locked,
  () => options,
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

locked = true
prevented = false
const beforeLocked = scales.length
listeners[0].handler({
  target: el,
  deltaY: 100,
  deltaX: 0,
  ctrlKey: false,
  metaKey: false,
  preventDefault() { prevented = true },
})
assert.equal(prevented, true)
assert.equal(scales.length, beforeLocked + 1)

options = { trackpadMode: true, sensitivity: 0.5 }
const beforeTrackpad = scale
listeners[0].handler({
  target: el,
  deltaY: -2,
  deltaX: 0,
  deltaMode: 0,
  ctrlKey: true,
  metaKey: false,
  preventDefault() {},
})
assert.ok(scale > beforeTrackpad)
assert.ok(scale < beforeTrackpad * 1.01, 'small trackpad deltas should allow sub-percent tuning')

const lowSensitivity = nextWheelScale(1, { deltaY: -20, deltaMode: 0 }, {
  trackpadMode: true,
  sensitivity: 0.25,
})
const highSensitivity = nextWheelScale(1, { deltaY: -20, deltaMode: 0 }, {
  trackpadMode: true,
  sensitivity: 2,
})
assert.ok(highSensitivity > lowSensitivity)
assert.equal(nextWheelScale(1, { deltaY: 0 }, { trackpadMode: true }), 1)
assert.equal(nextWheelScale(1, { deltaY: 100 }, { trackpadMode: false }), 0.9)

cleanup()
assert.equal(listeners.length, 0)

console.log('wheel-zoom: pass')
