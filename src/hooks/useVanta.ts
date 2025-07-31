// src/hooks/useVanta.ts
import { useRef, useEffect, RefObject } from 'react'

type VantaName = 'NET' | 'BIRDS' | 'FOG' | 'WAVES' /* и т.п. */
interface VantaOptions {
  el: HTMLElement
  THREE: any
  [key: string]: any
}

declare global {
  interface Window {
    THREE: any
    VANTA: {
      [K in VantaName]: (opts: VantaOptions) => { destroy: () => void }
    }
  }
}

export function useVanta(
  name: VantaName,
  options: Omit<VantaOptions, 'el' | 'THREE'>
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null)
  const instance = useRef<{ destroy: () => void }>()

  useEffect(() => {
    let canceled = false

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }
        const s = document.createElement('script')
        s.src = src
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.head.appendChild(s)
      })

    // Сначала THREE, потом сам эффект
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
      .then(() =>
        loadScript(
          `https://cdn.jsdelivr.net/npm/vanta/dist/vanta.${name.toLowerCase()}.min.js`
        )
      )
      .then(() => {
        if (canceled || !ref.current) return
        const V = window.VANTA && window.VANTA[name]
        if (typeof V !== 'function') {
          console.error(`[Vanta] effect "${name}" not found on window.VANTA`)
          return
        }
        instance.current = V({
          el: ref.current!,
          THREE: window.THREE,
          ...options,
        })
      })
      .catch((e) => console.error('[Vanta] Failed to load:', e))

    return () => {
      canceled = true
      instance.current?.destroy()
    }
  }, [name, JSON.stringify(options)])

  return ref
}
