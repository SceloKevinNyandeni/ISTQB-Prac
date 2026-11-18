import { useCallback, useEffect, useState } from 'react'
import type { Examination } from '../types/examination'
import type { Question } from '../types/question'
import { computeResult, type ExamResult } from '../services/resultsService'
import { load, save, remove } from '../utils/sessionStorage'
import { newId } from '../utils/examinationHelpers'
import { recordExamOutcomes } from '../services/progressService'

export interface RtSession {
  sessionId: string; examId: string; status: 'instructions' | 'active' | 'submitted'
  extraTime: boolean; startedAt: number | null; deadline: number | null
  current: number; answers: Record<string, string[]>; flagged: string[]
  submittedAt: number | null; expired: boolean; result: ExamResult | null
}
export const RT_KEY = 'rtSession'
export const HISTORY_KEY = 'history'
const fresh = (examId: string): RtSession => ({ sessionId: newId(), examId, status: 'instructions', extraTime: false, startedAt: null,
  deadline: null, current: 0, answers: {}, flagged: [], submittedAt: null, expired: false, result: null })

/** Called before opening the exam page. Returns false if the user chose to keep an in-progress exam instead. */
export function prepareRealTime(examId: string): boolean {
  const s = load<RtSession | null>(RT_KEY, null)
  if (!s) return true
  if (s.status === 'active') {
    if (s.examId === examId) return true
    if (!window.confirm('An examination is already in progress. Abandon it and start a new one?')) return false
  }
  remove(RT_KEY); return true
}

export function useExamSession(exam: Examination, questions: Question[]) {
  const [session, setSession] = useState<RtSession>(() => {
    const s = load<RtSession | null>(RT_KEY, null)
    return s && s.examId === exam.id ? s : fresh(exam.id)
  })
  useEffect(() => { save(RT_KEY, session) }, [session])

  const begin = useCallback((extraTime: boolean) => setSession((s) => {
    if (s.status !== 'instructions' || !exam.durationMinutes) return s
    const now = Date.now(); const minutes = exam.durationMinutes * (extraTime && exam.extraTimePercent ? 1 + exam.extraTimePercent / 100 : 1)
    return { ...s, status: 'active', extraTime, startedAt: now, deadline: now + minutes * 60000 }
  }), [exam])
  const select = useCallback((qid: string, opt: string, multi: boolean, max: number) => setSession((s) => {
    if (s.status !== 'active') return s
    const cur = s.answers[qid] ?? []
    const next = !multi ? [opt] : cur.includes(opt) ? cur.filter((o) => o !== opt) : cur.length < max ? [...cur, opt] : cur
    return { ...s, answers: { ...s.answers, [qid]: next } }
  }), [])
  const clear = useCallback((qid: string) => setSession((s) => {
    if (s.status !== 'active') return s
    const { [qid]: _removed, ...rest } = s.answers; return { ...s, answers: rest }
  }), [])
  const goto = useCallback((i: number) => setSession((s) => (s.status === 'active' ? { ...s, current: Math.min(Math.max(i, 0), questions.length - 1) } : s)), [questions.length])
  const toggleFlag = useCallback((qid: string) => setSession((s) => s.status !== 'active' ? s :
    { ...s, flagged: s.flagged.includes(qid) ? s.flagged.filter((f) => f !== qid) : [...s.flagged, qid] }), [])
  const submit = useCallback((expired: boolean) => setSession((s) => {
    if (s.status !== 'active' || s.startedAt === null || s.deadline === null) return s
    const endedAt = expired ? s.deadline : Math.min(Date.now(), s.deadline)
    const result = computeResult(s.sessionId, exam, questions, s.answers, s.startedAt, endedAt, expired)
    const hist = load<ExamResult[]>(HISTORY_KEY, [])
    if (!hist.some((r) => r.sessionId === result.sessionId)) save(HISTORY_KEY, [...hist, result])
    recordExamOutcomes(result.sessionId, result.outcomes)
    return { ...s, status: 'submitted', submittedAt: endedAt, expired, result }
  }), [exam, questions])
  const finish = useCallback(() => { remove(RT_KEY) }, [])
  return { session, begin, select, clear, goto, toggleFlag, submit, finish }
}
