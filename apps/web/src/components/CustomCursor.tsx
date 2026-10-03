import { useEffect, useRef } from 'react'

import './custom-cursor.css'

const interactiveSelector = 'a, button, [role="button"], select, label, [data-cursor="interactive"]'
const editableSelector = 'input, textarea, [contenteditable="true"]'

export function CustomCursor() {
  const dotRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return

    const root = document.documentElement
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let targetX = -100
    let targetY = -100
    let ringX = -100
    let ringY = -100
    let frame = 0

    root.classList.add('custom-cursor-enabled')

    const animate = () => {
      ringX += (targetX - ringX) * 0.18
      ringY += (targetY - ringY) * 0.18
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      frame = window.requestAnimationFrame(animate)
    }

    const move = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
      const element = event.target instanceof Element ? event.target : null
      const editable = Boolean(element?.closest(editableSelector))
      ring.classList.toggle('is-interactive', !editable && Boolean(element?.closest(interactiveSelector)))
      ring.classList.toggle('is-hidden', editable)
      dot.classList.toggle('is-hidden', editable)
      ring.classList.add('is-visible')
      dot.classList.add('is-visible')
    }

    const leave = () => {
      ring.classList.remove('is-visible')
      dot.classList.remove('is-visible')
    }
    const press = () => ring.classList.add('is-pressed')
    const release = () => ring.classList.remove('is-pressed')

    frame = window.requestAnimationFrame(animate)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    window.addEventListener('pointerdown', press, { passive: true })
    window.addEventListener('pointerup', release, { passive: true })

    return () => {
      root.classList.remove('custom-cursor-enabled')
      window.cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('mouseleave', leave)
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
    }
  }, [])

  return (
    <div className="custom-cursor" aria-hidden="true">
      <span className="custom-cursor__ring" ref={ringRef} />
      <span className="custom-cursor__dot" ref={dotRef} />
    </div>
  )
}
