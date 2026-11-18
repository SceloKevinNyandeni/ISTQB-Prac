import { load, save } from '../utils/sessionStorage'
export interface Attempt { n: number; right: number; wrong: number; correct: boolean }
export interface Progress { attempts: Record<string, Attempt>; incorrect: string[]; examsProcessed: string[] }
const KEY = 'progress'
export function getProgress(): Progress {
  const p = load<Partial<Progress>>(KEY, {})
  return { attempts: p.attempts ?? {}, incorrect: p.incorrect ?? [], examsProcessed: p.examsProcessed ?? [] }
}
function apply(p: Progress, qid: string, correct: boolean): void {
  const a = p.attempts[qid] ?? { n: 0, right: 0, wrong: 0, correct }
  p.attempts[qid] = { n: a.n + 1, right: a.right + (correct ? 1 : 0), wrong: a.wrong + (correct ? 0 : 1), correct }
  p.incorrect = correct ? p.incorrect.filter((i) => i !== qid) : p.incorrect.includes(qid) ? p.incorrect : [...p.incorrect, qid]
}
/** One completed answer in Interactive Learning. The latest result decides whether the question is still in revision. */
export function recordAnswer(qid: string, correct: boolean): void { const p = getProgress(); apply(p, qid, correct); save(KEY, p) }
/** Answered questions from a submitted Real-Time examination. Idempotent per session. */
export function recordExamOutcomes(sessionId: string, outcomes: { id: string; correct: boolean }[]): void {
  const p = getProgress(); if (p.examsProcessed.includes(sessionId)) return
  outcomes.forEach((o) => apply(p, o.id, o.correct)); p.examsProcessed.push(sessionId); save(KEY, p)
}
