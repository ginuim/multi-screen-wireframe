import assert from 'node:assert/strict'
import {
  findFlowTargetId,
  handleDelegatedFlowClick,
} from '../starter/framework/lib/ui/flow-target.js'

function el(attrs = {}, parent = null) {
  const node = {
    parentElement: parent,
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null
    },
    closest(selector) {
      if (selector !== '[data-flow-to]') return null
      let cur = this
      while (cur) {
        if (cur.getAttribute('data-flow-to')) return cur
        cur = cur.parentElement
      }
      return null
    },
    contains(other) {
      let cur = other
      while (cur) {
        if (cur === this) return true
        cur = cur.parentElement
      }
      return false
    },
  }
  return node
}

const root = el()
const target = el({ 'data-flow-to': 'edit' }, root)
const nested = el({}, target)

assert.equal(findFlowTargetId(nested, root), 'edit')
assert.equal(findFlowTargetId(el({}, root), root), null)
assert.equal(findFlowTargetId(target, el()), null)

const calls = []
let stopped = false
assert.equal(
  handleDelegatedFlowClick(
    {
      target: nested,
      preventDefault() {},
      stopPropagation() { stopped = true },
    },
    root,
    (id) => calls.push(id),
  ),
  true,
)
assert.deepEqual(calls, ['edit'])
assert.equal(stopped, true)

assert.equal(
  handleDelegatedFlowClick(
    {
      target: el({}, root),
      preventDefault() {},
      stopPropagation() { throw new Error('should not stop') },
    },
    root,
    () => { throw new Error('should not navigate') },
  ),
  false,
)

console.log('flow-delegation: pass')
