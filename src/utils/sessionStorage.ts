const PREFIX = 'istqb-practice:'
export function load<T>(key: string, fallback: T): T {
  try { const raw = window.sessionStorage.getItem(PREFIX + key); return raw ? (JSON.parse(raw) as T) : fallback } catch { return fallback }
}
export function save<T>(key: string, value: T): void {
  try { window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}
export function remove(key: string): void {
  try { window.sessionStorage.removeItem(PREFIX + key) } catch { /* storage unavailable */ }
}
