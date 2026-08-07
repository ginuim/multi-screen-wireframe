import { clampScale, shouldZoomOnWheel } from './navigation.js'

/** 绑定非 passive wheel，才能合法 preventDefault（React onWheel 默认 passive）。 */
export function bindWheelZoom(el, getScale, setScale, getLocked = () => false) {
  if (!el) return () => {}
  const onWheel = (event) => {
    if (!shouldZoomOnWheel(event, { locked: getLocked() })) return
    event.preventDefault()
    setScale(clampScale(getScale() * (event.deltaY > 0 ? 0.9 : 1.1)))
  }
  el.addEventListener('wheel', onWheel, { passive: false })
  return () => el.removeEventListener('wheel', onWheel)
}

export function useWheelZoom(elementRef, scale, setScale, locked = false) {
  const scaleRef = React.useRef(scale)
  const lockedRef = React.useRef(locked)
  scaleRef.current = scale
  lockedRef.current = locked

  React.useEffect(
    () => bindWheelZoom(
      elementRef.current,
      () => scaleRef.current,
      setScale,
      () => lockedRef.current,
    ),
    [elementRef, setScale],
  )
}
