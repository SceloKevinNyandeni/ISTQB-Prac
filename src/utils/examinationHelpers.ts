export function formatClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000)); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`
}
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60), s = seconds % 60
  return `${m} min ${String(s).padStart(2, '0')} s`
}
export const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2))
