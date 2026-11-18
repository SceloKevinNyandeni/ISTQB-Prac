import { useCallback, useEffect, useState } from 'react'
import type { Question } from '../types/question'
import { evaluate } from '../services/answerEvaluator'
import { resolveSource, type LearningSource } from '../services/learningService'
import { recordAnswer } from '../services/progressService'
import { load, save, remove } from '../utils/sessionStorage'
import { newId } from '../utils/examinationHelpers'

export interface LearnSession { sessionId: string; title: string; source: LearningSource; ids: string[]; current: number
  answers: Record<string, string[]>; flagged: string[]; startedAt: number }
export const LEARN_KEY = 'learnSession'

function create(source: LearningSource): LearnSession | null {
  const { title, ids } = resolveSource(source)
  return ids.length ? { sessionId: newId(), title, source, ids, current: 0, answers: {}, flagged: [], startedAt: Date.now() } : null
}
/** Starts a session (used from other pages before navigating). Returns false if nothing was started. */
export function startLearning(source: LearningSource): boolean {
  const old = load<LearnSession | null>(LEARN_KEY, null)
  if (old && Object.keys(old.answers).length > 0 && !window.confirm('Replace your current Interactive Learning session?')) return false
  const s = create(source); if (!s) return false
  save(LEARN_KEY, s); return true
}

export function useLearningSession() {
  const [session, setSession] = useState<LearnSession | null>(() => load<LearnSession | null>(LEARN_KEY, null))
  useEffect(() => { if (session) save(LEARN_KEY, session); else remove(LEARN_KEY) }, [session])
  const start = useCallback((source: LearningSource) => { const s = create(source); if (s) setSession(s); return s !== null }, [])
  const select = useCallback((q: Question, opt: string) => {
    if (!session) return
    const multi = q.type === 'multiple-select'; const cur = session.answers[q.id] ?? []
    const next = !multi ? [opt] : cur.includes(opt) ? cur.filter((o) => o !== opt) : cur.length < q.selectCount ? [...cur, opt] : cur
    if (next.length === cur.length && next.every((x) => cur.includes(x))) return
    setSession({ ...session, answers: { ...session.answers, [q.id]: next } })
    if (next.length === q.selectCount) recordAnswer(q.id, evaluate(q, next).correct)
  }, [session])
  const goto = useCallback((i: number) => setSession((s) => (s ? { ...s, current: Math.min(Math.max(i, 0), s.ids.length - 1) } : s)), [])
  const toggleFlag = useCallback((qid: string) => setSession((s) => (s ? { ...s, flagged: s.flagged.includes(qid) ? s.flagged.filter((f) => f !== qid) : [...s.flagged, qid] } : s)), [])
  const restart = useCallback(() => setSession((s) => (s ? { ...s, answers: {}, current: 0, sessionId: newId() } : s)), [])
  const end = useCallback(() => setSession(null), [])
  return { session, start, select, goto, toggleFlag, restart, end }
}
