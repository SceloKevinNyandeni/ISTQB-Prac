import type { Examination } from '../types/examination'
import type { Question } from '../types/question'
import { evaluate } from './answerEvaluator'

export interface ChapterStat { chapter: string; title: string; attempted: number; correct: number }
export interface ExamResult {
  sessionId: string; examId: string; title: string; mode: 'real-time' | 'learning'
  total: number; correct: number; incorrect: number; unanswered: number
  marks: number; maxMarks: number; percent: number
  passed: boolean | null; passMarkPoints: number | null; passMarkPercent: number | null
  timeTakenSeconds: number; expired: boolean; completedAt: number
  perChapter: ChapterStat[]; incorrectIds: string[]
  outcomes: { id: string; chapter: string; correct: boolean }[]
}
export function computeResult(sessionId: string, exam: Examination, questions: Question[], answers: Record<string, string[]>,
  startedAt: number, endedAt: number, expired: boolean): ExamResult {
  let correct = 0, incorrect = 0, unanswered = 0, marks = 0
  const chapters = new Map<string, ChapterStat>(); const incorrectIds: string[] = []; const outcomes: ExamResult['outcomes'] = []
  for (const q of questions) {
    const ev = evaluate(q, answers[q.id])
    const ref = q.syllabusReference
    const stat = chapters.get(ref.chapter) ?? { chapter: ref.chapter, title: ref.chapterTitle, attempted: 0, correct: 0 }
    if (!ev.answered) unanswered++
    else { stat.attempted++; if (ev.correct) { correct++; stat.correct++ } else { incorrect++; incorrectIds.push(q.id) } }
    if (ev.answered) outcomes.push({ id: q.id, chapter: ref.chapter, correct: ev.correct })
    marks += ev.marks; chapters.set(ref.chapter, stat)
  }
  const maxMarks = questions.reduce((s, q) => s + q.marks, 0)
  const passed = exam.passMarkPoints !== null ? marks >= exam.passMarkPoints : null
  return { sessionId, examId: exam.id, title: exam.title, mode: 'real-time', total: questions.length, correct, incorrect, unanswered,
    marks, maxMarks, percent: maxMarks ? Math.round((marks / maxMarks) * 1000) / 10 : 0, passed,
    passMarkPoints: exam.passMarkPoints, passMarkPercent: exam.passMarkPercent,
    timeTakenSeconds: Math.max(0, Math.round((endedAt - startedAt) / 1000)), expired, completedAt: endedAt,
    perChapter: [...chapters.values()].sort((a, b) => Number(a.chapter) - Number(b.chapter)), incorrectIds, outcomes }
}
