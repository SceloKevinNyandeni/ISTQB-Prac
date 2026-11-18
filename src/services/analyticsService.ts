import syllabus from '../data/syllabus.json'
import type { Syllabus } from '../types/syllabus'
import type { Question } from '../types/question'
import type { ExamResult } from './resultsService'
import { getQuestionById } from './examinationService'
import { getProgress } from './progressService'
import { load } from '../utils/sessionStorage'
import { HISTORY_KEY } from '../hooks/useExamSession'

export interface ChapterPerf { chapter: string; title: string; attempts: number; right: number; accuracy: number | null }
export interface IncorrectQ { q: Question; wrong: number; attempts: number; stillIncorrect: boolean }
export interface Analytics {
  history: ExamResult[]; exams: number; passed: number; failed: number; passRate: number | null; avgScore: number | null
  attempts: number; uniqueQuestions: number; right: number; accuracy: number | null
  chapters: ChapterPerf[]; incorrect: IncorrectQ[]; stillIncorrectIds: string[]
}
export const WEAK_BELOW = 65 // the ISTQB pass mark (percent), used to flag chapters needing revision
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : null)

export function getAnalytics(): Analytics {
  const history = load<ExamResult[]>(HISTORY_KEY, []); const prog = getProgress()
  const scored = history.filter((h) => h.passed !== null)
  const passed = scored.filter((h) => h.passed).length
  const chap = new Map<string, ChapterPerf>()
  for (const c of (syllabus as Syllabus).chapters) chap.set(c.number, { chapter: c.number, title: c.title, attempts: 0, right: 0, accuracy: null })
  let attempts = 0, right = 0; const incorrect: IncorrectQ[] = []
  for (const [id, a] of Object.entries(prog.attempts)) {
    const q = getQuestionById(id); if (!q) continue
    attempts += a.n; right += a.right
    const c = chap.get(q.syllabusReference.chapter); if (c) { c.attempts += a.n; c.right += a.right }
    if (a.wrong > 0) incorrect.push({ q, wrong: a.wrong, attempts: a.n, stillIncorrect: prog.incorrect.includes(id) })
  }
  const chapters = [...chap.values()].map((c) => ({ ...c, accuracy: pct(c.right, c.attempts) }))
  incorrect.sort((a, b) => b.wrong - a.wrong || Number(b.stillIncorrect) - Number(a.stillIncorrect) || a.q.id.localeCompare(b.q.id))
  return { history, exams: history.length, passed, failed: scored.length - passed, passRate: pct(passed, scored.length),
    avgScore: history.length ? Math.round((history.reduce((s, h) => s + h.percent, 0) / history.length) * 10) / 10 : null,
    attempts, uniqueQuestions: Object.keys(prog.attempts).length, right, accuracy: pct(right, attempts), chapters, incorrect, stillIncorrectIds: prog.incorrect }
}
