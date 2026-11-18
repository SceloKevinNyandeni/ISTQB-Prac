import { useEffect, useReducer, useRef } from 'react'
/** Remaining ms until an absolute deadline timestamp. Always derived from the clock (never a decrementing counter),
 *  re-rendered every 250 ms and when the tab becomes visible again, so it stays accurate in background tabs. */
export function useTimer(deadline: number | null, onExpire: () => void): number | null {
  const [, refresh] = useReducer((n: number) => n + 1, 0)
  const expire = useRef(onExpire); expire.current = onExpire
  const fired = useRef(false)
  useEffect(() => {
    fired.current = false
    if (deadline === null) return
    const tick = () => {
      refresh()
      if (deadline - Date.now() <= 0 && !fired.current) { fired.current = true; expire.current() }
    }
    tick()
    const id = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', tick) }
  }, [deadline])
  return deadline === null ? null : Math.max(0, deadline - Date.now())
}
