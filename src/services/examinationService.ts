import examinations from '../data/examinations.json'
import type { Examination } from '../types/examination'
import type { Question } from '../types/question'

const files = import.meta.glob('../data/questions/*.json', { eager: true, import: 'default' }) as Record<string, Question[]>
export const getExaminations = (): Examination[] => examinations as Examination[]
export const getExamination = (id: string) => getExaminations().find((e) => e.id === id)
export function getQuestions(exam: Examination): Question[] {
  const key = Object.keys(files).find((k) => k.endsWith('/' + exam.questionFile))
  return key ? files[key] : []
}

export const getAllQuestions = (): Question[] => Object.values(files).flat()
let byId: Map<string, Question> | null = null
export const getQuestionById = (id: string): Question | undefined => { if (!byId) byId = new Map(getAllQuestions().map((q) => [q.id, q])); return byId.get(id) }
