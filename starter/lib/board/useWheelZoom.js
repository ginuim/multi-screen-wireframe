import { clampScale, shouldZoomOnWheel } from './navigation.js'

/** 绑定非 passive wheel，才能合法 preventDefault（React onWheel 默认 passive）。 */
export function bindWheelZoom(el, getScale, setScale) {
  if (!el) return () => {}
  const onWheel = (event) => {
    if (!shouldZoomOnWheel(event)) return
    event.preventDefault()
    setScale(clampScale(getScale() * (event.deltaY > 0 ? 0.9 : 1.1)))
  }
  el.addEventListener('wheel', onWheel, { passive: false })
  return () => el.removeEventListener('wheel', onWheel)
}

export function useWheelZoom(elementRef, scale, setScale) {
  const scaleRef = React.useRef(scale)
  scaleRef.current = scale

  React.useEffect(
    () => bindWheelZoom(
      elementRef.current,
      () => scaleRef.current,
      setScale,
    ),
    [elementRef, setScale],
  )
}
