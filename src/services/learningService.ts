import syllabus from '../data/syllabus.json'
import type { Syllabus } from '../types/syllabus'
import { getAllQuestions, getExamination, getQuestions } from './examinationService'
import { getProgress } from './progressService'

export type LearningSource =
  | { kind: 'exam'; examId: string } | { kind: 'chapter'; chapter: string } | { kind: 'revision' } | { kind: 'ids'; ids: string[]; label: string }
const syl = syllabus as Syllabus
export function resolveSource(src: LearningSource): { title: string; ids: string[] } {
  if (src.kind === 'exam') { const e = getExamination(src.examId); return { title: e?.title ?? src.examId, ids: e ? getQuestions(e).map((q) => q.id) : [] } }
  if (src.kind === 'chapter') {
    const ch = syl.chapters.find((c) => c.number === src.chapter)
    return { title: `Chapter ${src.chapter} – ${ch?.title ?? ''}`, ids: getAllQuestions().filter((q) => q.syllabusReference.chapter === src.chapter).map((q) => q.id) }
  }
  if (src.kind === 'revision') { const bad = new Set(getProgress().incorrect); return { title: 'Revision of incorrect answers', ids: getAllQuestions().filter((q) => bad.has(q.id)).map((q) => q.id) } }
  return { title: src.label, ids: src.ids }
}
export const chapterCounts = () => syl.chapters.map((c) => ({ number: c.number, title: c.title, count: getAllQuestions().filter((q) => q.syllabusReference.chapter === c.number).length }))
